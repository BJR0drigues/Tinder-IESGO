import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const events = await prisma.campusEvent.findMany({
      where: { 
        isActive: true,
        date: { gte: yesterday }
      },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json({ events: events.map(e => ({
      ...e,
      date: e.date.getTime(),
    })) });
  } catch (err) {
    console.error('[events GET]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const body = await req.json();
    const { title, description, location, date, category, organizer, emoji } = body;

    if (!title || !description || !location || !date || !category || !organizer) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }

    const event = await prisma.campusEvent.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
        category,
        organizer,
        emoji: emoji ?? '📅',
        isActive: true,
        createdById: session.userId,
      },
    });

    return NextResponse.json({ event: { ...event, date: event.date.getTime() } }, { status: 201 });
  } catch (err) {
    console.error('[events POST]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
