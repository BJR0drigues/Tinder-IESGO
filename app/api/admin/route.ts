import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Rota de admin local para gerenciar o banco durante o showcase.
// Só aceita requisições de localhost para evitar uso acidental.
function isLocal(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export async function GET(req: NextRequest) {
  if (!isLocal(req)) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }
  const [users, matches, messages, events] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, course: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.match.count(),
    prisma.message.count(),
    prisma.campusEvent.findMany({
      select: { id: true, title: true, emoji: true, category: true, date: true, attendees: true },
      where:  { isActive: true },
      orderBy: { date: 'asc' },
    }),
  ]);
  return NextResponse.json({
    users,
    events,
    stats: { users: users.length, matches, messages, events: events.length },
  });
}

export async function DELETE(req: NextRequest) {
  if (!isLocal(req)) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const action  = searchParams.get('action');
  const eventId = searchParams.get('eventId');

  // Deletar evento específico
  if (action === 'delete-event' && eventId) {
    await prisma.eventMessage.deleteMany({ where: { eventId } });
    await prisma.eventAttendance.deleteMany({ where: { eventId } });
    await prisma.campusEvent.delete({ where: { id: eventId } });
    return NextResponse.json({ ok: true, message: 'Evento removido.' });
  }

  // Deletar todos os eventos
  if (action === 'reset-events') {
    await prisma.eventMessage.deleteMany();
    await prisma.eventAttendance.deleteMany();
    await prisma.campusEvent.deleteMany();
    return NextResponse.json({ ok: true, message: 'Todos os eventos removidos.' });
  }

  if (action === 'reset-all') {
    await prisma.message.deleteMany();
    await prisma.eventMessage.deleteMany();
    await prisma.match.deleteMany();
    await prisma.swipeAction.deleteMany();
    await prisma.eventAttendance.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.userStats.deleteMany();
    await prisma.oTPCode.deleteMany();
    await prisma.user.deleteMany();
    await prisma.campusEvent.deleteMany();
    return NextResponse.json({ ok: true, message: 'Banco resetado com sucesso.' });
  }

  if (action === 'reset-activity') {
    await prisma.message.deleteMany();
    await prisma.eventMessage.deleteMany();
    await prisma.match.deleteMany();
    await prisma.swipeAction.deleteMany();
    await prisma.userStats.deleteMany();
    return NextResponse.json({ ok: true, message: 'Atividade (matches, mensagens, swipes) resetada.' });
  }

  return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
}
