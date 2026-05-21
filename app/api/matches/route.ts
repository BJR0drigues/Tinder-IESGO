export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: session.userId },
          { user2Id: session.userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true, firstName: true, lastName: true,
            photos: true, course: true, verified: true,
            bio: true, interests: true, dateOfBirth: true, intention: true,
          },
        },
        user2: {
          select: {
            id: true, firstName: true, lastName: true,
            photos: true, course: true, verified: true,
            bio: true, interests: true, dateOfBirth: true, intention: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take:    1,
          select:  { id: true, content: true, senderId: true, createdAt: true },
        },
        _count: {
          select: {
            messages: {
              where: { senderId: { not: session.userId }, isRead: false },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = matches.map(m => {
      const other = m.user1Id === session.userId ? m.user2 : m.user1;
      const lastMsg = m.messages[0] ?? null;

      return {
        id:              m.id,
        type:            m.type,
        createdAt:       m.createdAt,
        other: {
          ...other,
          photos: (() => { try { return JSON.parse(other.photos ?? '[]'); } catch { return []; } })(),
          interests: (() => { try { return JSON.parse(other.interests ?? '[]'); } catch { return []; } })(),
        },
        lastMessage:     lastMsg?.content ?? null,
        lastMessageTime: lastMsg?.createdAt ?? null,
        unreadCount:     m._count.messages,
      };
    });

    return NextResponse.json({ matches: formatted });
  } catch (err) {
    console.error('[matches]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
