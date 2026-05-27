export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import {
  sortFeedByCompatibility,
  genderMatch,
  ageMatch,
  type MatchProfile,
} from '@/lib/match-algorithm';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Filtros opcionais via query params
    const { searchParams } = new URL(req.url);

    // IDs já swipados pelo usuário atual
    const reset = searchParams.get('reset') === 'true';
    const swipedIds = reset ? [] : await prisma.swipeAction.findMany({
      where:  { fromUserId: session.userId },
      select: { toUserId: true },
    });
    const excludedIds = [session.userId, ...swipedIds.map(s => s.toUserId)];
    const courseFilter    = searchParams.get('course');
    const interestFilter  = searchParams.get('interest');

    const rawUsers = await prisma.user.findMany({
      where: {
        id:       { notIn: excludedIds },
        isActive: true,
        ...(courseFilter ? { course: courseFilter } : {}),
      },
      select: {
        id:          true,
        firstName:   true,
        lastName:    true,
        dateOfBirth: true,
        gender:      true,
        bio:         true,
        bioTone:     true,
        interests:   true,
        photos:      true,
        lookingFor:  true,
        course:      true,
        semester:    true,
        shift:       true,
        intention:   true,
        city:        true,
        state:       true,
        maxDistance: true,
        minAge:      true,
        maxAge:      true,
        verified:    true,
        pronouns:    true,
        showGender:  true,
      },
    });

    const safeJson = (raw: string | null, fallback: unknown[] = []) => {
      try { return JSON.parse(raw ?? '[]'); } catch { return fallback; }
    };

    const currentProfile: MatchProfile = {
      id:          currentUser.id,
      course:      currentUser.course,
      interests:   safeJson(currentUser.interests),
      shift:       currentUser.shift,
      intention:   currentUser.intention,
      gender:      currentUser.gender,
      dateOfBirth: currentUser.dateOfBirth,
      lookingFor:  safeJson(currentUser.lookingFor),
      minAge:      currentUser.minAge,
      maxAge:      currentUser.maxAge,
    };

    // Parsear usuários e filtrar (ignorar usuários com dados corrompidos)
    const candidates: MatchProfile[] = rawUsers
      .filter(u => {
        try { JSON.parse(u.interests); JSON.parse(u.lookingFor); return true; }
        catch { return false; }
      })
      .map(u => ({
        id:          u.id,
        course:      u.course,
        interests:   safeJson(u.interests),
        shift:       u.shift,
        intention:   u.intention,
        gender:      u.gender,
        dateOfBirth: u.dateOfBirth,
        lookingFor:  safeJson(u.lookingFor),
        minAge:      u.minAge,
        maxAge:      u.maxAge,
      }));

    // Ordenar pelo algoritmo de compatibilidade
    const ranked = sortFeedByCompatibility(currentProfile, candidates);

    const filtered = interestFilter
      ? ranked.filter(u => u.interests.includes(interestFilter))
      : ranked;

    const rawMap = new Map(rawUsers.map(u => [u.id, u]));

    const feedUsers = filtered.map(ranked => {
      const raw = rawMap.get(ranked.id)!;
      return {
        ...raw,
        interests:  safeJson(raw.interests),
        photos:     safeJson(raw.photos),
        lookingFor: safeJson(raw.lookingFor),
        compatibility: ranked.compatibility,
      };
    });

    return NextResponse.json({ users: feedUsers });
  } catch (err) {
    console.error('[feed]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
