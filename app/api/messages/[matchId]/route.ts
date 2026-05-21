export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || (match.user1Id !== session.userId && match.user2Id !== session.userId)) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where:   { matchId },
      orderBy: { createdAt: 'asc' },
    });

    // Marcar como lidas apenas se houver mensagens não lidas (evita UPDATE desnecessário)
    const hasUnread = messages.some(m => m.senderId !== session.userId && !m.isRead);
    if (hasUnread) {
      prisma.message.updateMany({
        where: { matchId, senderId: { not: session.userId }, isRead: false },
        data:  { isRead: true },
      }).catch(() => {});
    }

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[messages GET]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { content, type = 'text' } = await req.json() as {
      content: string;
      type?:   'text' | 'image' | 'icebreaker';
    };

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Mensagem não pode ser vazia.' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || (match.user1Id !== session.userId && match.user2Id !== session.userId)) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: { matchId, senderId: session.userId, content, type },
    });

    await prisma.userStats.upsert({
      where:  { userId: session.userId },
      update: { messagesSent: { increment: 1 } },
      create: { userId: session.userId, messagesSent: 1 },
    });

    return NextResponse.json({ message });
  } catch (err) {
    console.error('[messages POST]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
