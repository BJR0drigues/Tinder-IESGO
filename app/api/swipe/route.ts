export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { targetUserId, action } = await req.json() as {
      targetUserId: string;
      action:       'like' | 'pass' | 'study';
    };

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    // Registrar swipe (upsert para evitar duplicados)
    await prisma.swipeAction.upsert({
      where:  { fromUserId_toUserId: { fromUserId: session.userId, toUserId: targetUserId } },
      update: { action },
      create: { fromUserId: session.userId, toUserId: targetUserId, action },
    });

    // Estatísticas: fire-and-forget (não afeta resposta)
    prisma.userStats.upsert({
      where:  { userId: session.userId },
      update: {
        ...(action === 'like'  ? { likesGiven:      { increment: 1 } } : {}),
        ...(action === 'pass'  ? { passesGiven:     { increment: 1 } } : {}),
        ...(action === 'study' ? { studyDatesGiven: { increment: 1 }, likesGiven: { increment: 1 } } : {}),
      },
      create: {
        userId:          session.userId,
        likesGiven:      action === 'like'  ? 1 : (action === 'study' ? 1 : 0),
        passesGiven:     action === 'pass'  ? 1 : 0,
        studyDatesGiven: action === 'study' ? 1 : 0,
      },
    }).catch(() => {});

    let matched   = false;
    let matchId   = null;

    if (action === 'like' || action === 'study') {
      // Verificar se o outro usuário já deu like/study de volta
      const reverseSwipe = await prisma.swipeAction.findFirst({
        where: {
          fromUserId: targetUserId,
          toUserId:   session.userId,
          action:     { in: ['like', 'study'] },
        },
      });

      if (reverseSwipe) {
        // Garantir ordem consistente para unique constraint
        const [u1, u2] = [session.userId, targetUserId].sort();

        const existingMatch = await prisma.match.findUnique({
          where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        });

        if (!existingMatch) {
          const newMatch = await prisma.match.create({
            data: {
              user1Id: u1,
              user2Id: u2,
              type:    action === 'study' ? 'study' : null,
            },
          });
          matchId = newMatch.id;

          // Atualizar contagem de matches para ambos os usuários
          await Promise.all([
            prisma.userStats.upsert({
              where:  { userId: session.userId },
              update: { matchCount: { increment: 1 } },
              create: { userId: session.userId, matchCount: 1 },
            }),
            prisma.userStats.upsert({
              where:  { userId: targetUserId },
              update: { matchCount: { increment: 1 } },
              create: { userId: targetUserId, matchCount: 1 },
            }),
          ]);

          // Se study date, enviar mensagem automática
          if (action === 'study') {
            await prisma.message.create({
              data: {
                matchId:  newMatch.id,
                senderId: session.userId,
                content:  'Oi! Vi que você topa um Study Date. Vamos marcar na biblioteca? ☕',
                type:     'text',
              },
            });
          }

          matched = true;
        }
      }
    }

    return NextResponse.json({ success: true, matched, matchId });
  } catch (err) {
    console.error('[swipe]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
