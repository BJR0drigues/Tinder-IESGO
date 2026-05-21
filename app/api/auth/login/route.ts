import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, setSessionCookie } from '@/lib/auth';

// Login via OTP já verificado — recebe contato e seta cookie
export async function POST(req: NextRequest) {
  try {
    const { contact, contactType } = await req.json() as {
      contact:     string;
      contactType: 'email' | 'phone';
    };

    const user = await prisma.user.findFirst({
      where: contactType === 'email' ? { email: contact } : { phone: contact },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const token = await createSession({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
