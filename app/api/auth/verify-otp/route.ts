import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { contact, code } = await req.json() as { contact: string; code: string };

    if (!contact || !code) {
      return NextResponse.json({ error: 'Contato e código são obrigatórios.' }, { status: 400 });
    }

    const otp = await prisma.oTPCode.findFirst({
      where: {
        contact,
        code,
        used:      false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      return NextResponse.json({ error: 'Código inválido ou expirado.' }, { status: 400 });
    }

    // Marcar OTP como usado
    await prisma.oTPCode.update({
      where: { id: otp.id },
      data:  { used: true },
    });

    // Verificar se usuário já existe (login) ou é novo (cadastro)
    const existingUser = await prisma.user.findFirst({
      where: otp.type === 'email'
        ? { email: contact }
        : { phone: contact },
    });

    return NextResponse.json({
      success:    true,
      isNewUser:  !existingUser,
      userId:     existingUser?.id ?? null,
    });
  } catch (err) {
    console.error('[verify-otp]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
