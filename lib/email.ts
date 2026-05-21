import nodemailer from 'nodemailer';

// ── Transportador SMTP ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   ?? 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Gerar código OTP de 6 dígitos ─────────────────────────────────
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Enviar email de verificação ───────────────────────────────────
export async function sendOTPEmail(to: string, code: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Arial', sans-serif; background: #080510; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; background: #1a1728; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #F07070, #A06090); padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 900; color: #fff; letter-spacing: 2px; }
        .body { padding: 32px; text-align: center; }
        .code { font-size: 48px; font-weight: 900; letter-spacing: 16px; color: #F07070; margin: 24px 0; font-family: monospace; }
        .message { color: #a09ab8; font-size: 14px; line-height: 1.6; }
        .footer { padding: 16px 32px; text-align: center; color: #4a4560; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TINDER IESGO</h1>
        </div>
        <div class="body">
          <p style="color: #e8e4f0; font-size: 18px; margin-bottom: 8px;">Seu código de verificação</p>
          <div class="code">${code}</div>
          <p class="message">
            Este código expira em <strong style="color: #F07070;">10 minutos</strong>.<br>
            Se você não solicitou este código, ignore este email.
          </p>
        </div>
        <div class="footer">
          Tinder IESGO · Campus Formosa-GO · 2026
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    `"Tinder IESGO" <${process.env.SMTP_USER}>`,
    to,
    subject: `${code} — Seu código de acesso ao Tinder IESGO`,
    html,
  });
}

// ── Log do OTP no console (desenvolvimento) ───────────────────────
export function logOTPDev(contact: string, code: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🔑 OTP para ${contact}: ${code}\n`);
  }
}
