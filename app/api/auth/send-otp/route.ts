import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, sendOTPEmail, logOTPDev } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { contact, type, isLoginAttempt } = await req.json() as { contact: string; type: 'email' | 'phone'; isLoginAttempt?: boolean };

    if (!contact || !type) {
      return NextResponse.json({ error: 'Contato e tipo são obrigatórios.' }, { status: 400 });
    }

    if (type === 'email' && !contact.includes('@')) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    if (isLoginAttempt) {
      const existingUser = await prisma.user.findFirst({
        where: type === 'email' ? { email: contact } : { phone: contact },
      });
      if (!existingUser) {
        return NextResponse.json({ success: false, notFound: true });
      }
    }

    // Rate limit: no máximo 1 OTP por minuto por contato
    const recentOTP = await prisma.oTPCode.findFirst({
      where: {
        contact,
        used:      false,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });
    if (recentOTP) {
      return NextResponse.json(
        { error: 'Aguarde 1 minuto antes de solicitar um novo código.' },
        { status: 429 }
      );
    }

    // Invalidar OTPs anteriores para este contato
    await prisma.oTPCode.updateMany({
      where: { contact, used: false },
      data:  { used: true },
    });

    const code      = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.oTPCode.create({
      data: { contact, type, code, expiresAt },
    });

    // Enviar email ou logar no console
    if (type === 'email') {
      try {
        await sendOTPEmail(contact, code);
      } catch (error) {
        console.error('[SMTP_ERROR]', error);
        // Se SMTP não configurado, apenas loga no dev
        logOTPDev(contact, code);
      }
    } else {
      // SMS — apenas loga no dev (integração Twilio pode ser adicionada)
      logOTPDev(contact, code);
    }

    const showCode = process.env.DEMO_MODE === 'true';
    return NextResponse.json({
      success: true,
      message: 'Código enviado!',
      ...(showCode ? { devCode: code } : {}),
    });
  } catch (err) {
    console.error('[send-otp]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
