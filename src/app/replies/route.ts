/**
 * 🔐 APA-HARDENED ROUTE: GET /replies
 *
 * Purpose:
 *   - Returns all non-expired posts (and their replies) for a specific cliq
 *   - Includes cliq members via memberships → user → profile
 *
 * Auth:
 *   - Requires user to be authenticated
 *
 * Params:
 *   - id: string (cliq ID)
 *
 * Returns:
 *   - 200 OK with cliq, posts, and replies
 *   - 401 if unauthenticated
 *   - 404 if cliq not found
 *   - 500 on server error
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cliq = await prisma.cliq.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    username: true,
                    image: true,
                    bannerImage: true,
                  },
                },
              },
            },
          },
        },
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
    console.error('[GET_REPLIES_ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
