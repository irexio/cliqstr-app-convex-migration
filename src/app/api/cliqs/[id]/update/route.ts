import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const cliqId = segments[segments.indexOf('cliqs') + 1];

    if (!cliqId) {
      return NextResponse.json({ error: 'Missing cliq ID' }, { status: 400 });
    }

    const body = await req.json();
    const { name, description, privacy } = body;

    const cliq = await prisma.cliq.findUnique({
      where: { id: cliqId },
    });

    if (!cliq || cliq.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.cliq.update({
      where: { id: cliqId },
      data: {
        name,
        description,
        privacy,
      },
    });

    return NextResponse.json({ cliq: updated });
  } catch (error) {
    console.error('[UPDATE_CLIQ]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
