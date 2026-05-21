import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      contact,
      contactType,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      pronouns,
      showGender,
      lookingFor,
      bio,
      bioTone,
      interests,
      photos,
      course,
      semester,
      shift,
      intention,
      city,
      state,
      maxDistance,
      minAge,
      maxAge,
      notifMatch,
      notifMessage,
      notifLike,
    } = data;

    // Validações básicas
    if (!contact || !firstName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando.' },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existing = await prisma.user.findFirst({
      where: contactType === 'email' ? { email: contact } : { phone: contact },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Usuário já cadastrado com este contato.' },
        { status: 409 }
      );
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email:       contactType === 'email' ? contact : null,
        phone:       contactType === 'phone' ? contact : null,
        contactType,
        firstName,
        lastName:    lastName ?? null,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        pronouns:    pronouns ?? null,
        showGender:  showGender ?? true,
        lookingFor:  JSON.stringify(lookingFor ?? []),
        bio:         bio ?? null,
        bioTone:     bioTone ?? null,
        interests:   JSON.stringify(interests ?? []),
        photos:      JSON.stringify(photos ?? []),
        course:      course ?? null,
        semester:    semester ? Number(semester) : null,
        shift:       shift ?? null,
        intention:   intention ?? null,
        city:        city ?? null,
        state:       state ?? null,
        maxDistance: maxDistance ?? 35,
        minAge:      minAge ?? 18,
        maxAge:      maxAge ?? 30,
        notifMatch:  notifMatch ?? true,
        notifMessage: notifMessage ?? true,
        notifLike:   notifLike ?? false,
        stats: {
          create: {}
        }
      },
    });

    // Criar sessão JWT
    const token = await createSession({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id:        user.id,
        firstName: user.firstName,
        email:     user.email,
      },
    });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Erro ao criar conta.' }, { status: 500 });
  }
}
