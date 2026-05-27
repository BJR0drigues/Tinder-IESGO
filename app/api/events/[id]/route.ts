import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const event = await prisma.campusEvent.findUnique({
      where: { id }
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 });
    }

    // Apenas o criador pode deletar
    if (event.createdById !== session.userId) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }

    await prisma.campusEvent.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[events DELETE]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
