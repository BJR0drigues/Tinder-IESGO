import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'tinder-iesgo-secret-change-in-production'
);

const COOKIE_NAME = 'iesgo_session';
const EXPIRES_IN  = '7d';

export interface SessionPayload {
  userId: string;
  email:  string | null;
}

// ── Criar JWT ────────────────────────────────────────────────────
export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

// ── Verificar JWT ─────────────────────────────────────────────────
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Definir cookie de sessão (server action / route handler) ──────
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly:  true,
    secure:    process.env.SECURE_COOKIES === 'true',
    sameSite:  'lax',
    maxAge:    60 * 60 * 24 * 7,
    path:      '/',
  });
}

// ── Limpar cookie de sessão ───────────────────────────────────────
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ── Obter sessão atual (server components) ────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ── Obter sessão a partir da requisição (route handlers) ──────────
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
