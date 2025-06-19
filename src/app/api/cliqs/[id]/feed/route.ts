export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const cliqId = pathSegments[pathSegments.indexOf('cliqs') + 1];

    if (!cliqId) {
      return NextResponse.json({ error: 'Missing cliq ID' }, { status: 400 });
    }

    const cliq = await prisma.cliq.findUnique({
      where: { id: cliqId },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { include: { profile: true } },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: { include: { profile: true } },
              },
            },
          },
        },
      },
    });

    if (!cliq) {
      return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    }

    return NextResponse.json({ cliqName: cliq.name, posts: cliq.posts });
  } catch (err) {
    console.error('Error fetching cliq feed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
