export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }) {
  const { id } = params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cliq = await prisma.cliq.findUnique({
      where: { id },
      include: {
        members: true,
        posts: {
          where: {
            expiresAt: {
              gte: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            replies: true,
          },
        },
      },
    });

    if (!cliq) {
      return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    }

    return NextResponse.json({ cliq });
  } catch (error) {
    console.error('Failed to fetch cliq:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
