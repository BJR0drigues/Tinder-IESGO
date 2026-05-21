export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

// PATCH — atualizar perfil do usuário logado
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const data = await req.json();

    // Campos permitidos para atualização
    const allowedFields = [
      'firstName', 'lastName', 'bio', 'bioTone', 'interests',
      'photos', 'bannerPhoto', 'course', 'semester', 'shift', 'intention',
      'city', 'state', 'maxDistance', 'minAge', 'maxAge',
      'lookingFor', 'gender', 'pronouns', 'showGender',
      'notifMatch', 'notifMessage', 'notifLike',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in data) {
        const val = data[field];
        // Serializar arrays como JSON string
        if (Array.isArray(val)) {
          updates[field] = JSON.stringify(val);
        } else {
          updates[field] = val;
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data:  updates,
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error('[profile PATCH]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
