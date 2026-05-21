import { NextResponse } from 'next/server';
import os from 'os';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

// Cache em memória — QR só é regerado se a URL mudar
let qrCache: { url: string; qrSvg: string } | null = null;

// Cache de stats com TTL de 5 segundos
let statsCache: { data: { users: number; matches: number; messages: number; events: number }; ts: number } | null = null;
const STATS_TTL = 5_000;

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function getQrSvg(url: string): Promise<string> {
  if (qrCache?.url === url) return qrCache.qrSvg;

  let svg = await QRCode.toString(url, {
    type:   'svg',
    color:  { dark: '#0d0b1a', light: '#ffffff' },
    margin: 2,
  });
  svg = svg
    .replace(/width="\d+"/, 'width="100%"')
    .replace(/height="\d+"/, 'height="100%"')
    .replace(/<svg /, '<svg style="display:block;" ');

  qrCache = { url, qrSvg: svg };
  return svg;
}

async function getStats() {
  const now = Date.now();
  if (statsCache && now - statsCache.ts < STATS_TTL) return statsCache.data;

  const [users, matches, messages, events] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.match.count(),
    prisma.message.count(),
    prisma.campusEvent.count({ where: { isActive: true } }),
  ]);

  const data = { users, matches, messages, events };
  statsCache = { data, ts: now };
  return data;
}

export async function GET() {
  try {
    const ip   = getLocalIP();
    const port = process.env.PORT ?? '3000';
    const url  = process.env.PUBLIC_URL ?? `http://${ip}:${port}`;

    const [qrSvg, stats] = await Promise.all([getQrSvg(url), getStats()]);

    return NextResponse.json({ url, qrSvg, stats });
  } catch (err) {
    console.error('[showcase]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
