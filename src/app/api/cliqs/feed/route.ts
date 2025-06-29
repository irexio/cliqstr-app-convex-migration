// 🔐 APA-HARDENED — Get posts and replies for a cliq
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cliqId = searchParams.get('id');

    if (!cliqId) {
      return NextResponse.json({ error: 'Missing cliq ID' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isMember = await prisma.membership.findFirst({
      where: {
        cliqId,
        userId: user.id,
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const posts = await prisma.post.findMany({
      where: {
        cliqId,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              include: {
                profile: {
                  select: { username: true },
                },
              },
            },
          },
        },
        author: {
          include: {
            profile: {
              select: { username: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('❌ Error loading cliq feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
