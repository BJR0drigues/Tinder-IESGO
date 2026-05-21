import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const messages = await prisma.eventMessage.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, photos: true, course: true } },
      },
    });

    return NextResponse.json({ messages: messages.map(m => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      user: {
        id: m.user.id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        photo: (() => {
          try { return JSON.parse(m.user.photos ?? '[]')[0] ?? null; } catch { return null; }
        })(),
        course: m.user.course,
      },
    })) });
  } catch (err) {
    console.error('[event messages GET]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 });

    const event = await prisma.campusEvent.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 });

    const message = await prisma.eventMessage.create({
      data: { eventId, userId: session.userId, content: content.trim() },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, photos: true, course: true } },
      },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        user: {
          id: message.user.id,
          firstName: message.user.firstName,
          lastName: message.user.lastName,
          photo: (() => {
            try { return JSON.parse(message.user.photos ?? '[]')[0] ?? null; } catch { return null; }
          })(),
          course: message.user.course,
        },
      },
    }, { status: 201 });
  } catch (err) {
    console.error('[event messages POST]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
