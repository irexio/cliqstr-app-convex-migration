// 🔐 APA-HARDENED — Fetch cliq feed by ID
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params in Next.js 15
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing cliq ID' }, { status: 400 });
    }

    const cliq = await prisma.cliq.findUnique({
      where: { id },
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

    return NextResponse.json({
      cliqName: cliq.name,
      posts: cliq.posts,
    });
  } catch (error) {
    console.error('Error in cliq feed route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
