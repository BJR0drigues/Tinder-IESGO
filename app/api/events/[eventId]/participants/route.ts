import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const attendances = await prisma.eventAttendance.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, photos: true, course: true, verified: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      participants: attendances.map(a => ({
        id: a.user.id,
        firstName: a.user.firstName,
        lastName: a.user.lastName,
        course: a.user.course,
        verified: a.user.verified,
        photo: (() => {
          try { return JSON.parse(a.user.photos ?? '[]')[0] ?? null; } catch { return null; }
        })(),
        joinedAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('[event participants GET]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const event = await prisma.campusEvent.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 });

    const existing = await prisma.eventAttendance.findUnique({
      where: { userId_eventId: { userId: session.userId, eventId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.eventAttendance.delete({ where: { id: existing.id } }),
        prisma.campusEvent.update({
          where: { id: eventId },
          data:  { attendees: { decrement: 1 } },
        }),
      ]);
      // Decrementar stats (evitar valor negativo)
      await prisma.userStats.updateMany({
        where: { userId: session.userId, eventsAttended: { gt: 0 } },
        data:  { eventsAttended: { decrement: 1 } },
      });
      return NextResponse.json({ attending: false });
    }

    await prisma.$transaction([
      prisma.eventAttendance.create({
        data: { userId: session.userId, eventId },
      }),
      prisma.campusEvent.update({
        where: { id: eventId },
        data:  { attendees: { increment: 1 } },
      }),
    ]);

    await prisma.userStats.upsert({
      where:  { userId: session.userId },
      update: { eventsAttended: { increment: 1 } },
      create: { userId: session.userId, eventsAttended: 1 },
    });

    return NextResponse.json({ attending: true });
  } catch (err) {
    console.error('[event participants POST]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
