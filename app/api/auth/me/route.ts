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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        stats:            true,
        achievements:     true,
        eventAttendances: { select: { eventId: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      id:          user.id,
      firstName:   user.firstName,
      lastName:    user.lastName,
      email:       user.email,
      phone:       user.phone,
      dateOfBirth: user.dateOfBirth,
      gender:      user.gender,
      pronouns:    user.pronouns,
      showGender:  user.showGender,
      bio:         user.bio,
      bioTone:     user.bioTone,
      interests:   JSON.parse(user.interests),
      photos:      (() => { try { return JSON.parse(user.photos ?? '[]'); } catch { return []; } })(),
      lookingFor:  JSON.parse(user.lookingFor),
      course:      user.course,
      semester:    user.semester,
      shift:       user.shift,
      intention:   user.intention,
      city:        user.city,
      state:       user.state,
      maxDistance: user.maxDistance,
      minAge:      user.minAge,
      maxAge:      user.maxAge,
      bannerPhoto: user.bannerPhoto,
      verified:    user.verified,
      role:        user.role,
      notifMatch:  user.notifMatch,
      notifMessage: user.notifMessage,
      notifLike:   user.notifLike,
      stats:            user.stats,
      achievements:     user.achievements,
      attendedEventIds: user.eventAttendances.map(a => a.eventId),
      createdAt:        user.createdAt,
    });
  } catch (err) {
    console.error('[me]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
