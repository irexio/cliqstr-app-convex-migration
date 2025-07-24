/**
 * 🔐 APA-HARDENED ROUTE: GET /api/scrapbook/[profileId]
 *
 * Purpose:
 *   - Fetches scrapbook items for a profile
 *   - Only returns items if users share a cliq
 *
 * Auth:
 *   - Requires valid session (user.id)
 *   - Enforces cliq membership check
 *
 * Returns:
 *   - 200 OK + scrapbook items array
 *   - 401 if unauthorized
 *   - 403 if no shared cliq
 *   - 500 on error
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { checkSharedCliqMembership } from '@/lib/auth/requireCliqMembership';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;
    
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the profile and its owner
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if users share a cliq (unless viewing own profile)
    if (profile.userId !== user.id) {
      const hasSharedCliq = await checkSharedCliqMembership(user.id, profile.userId);
      if (!hasSharedCliq) {
        return NextResponse.json({ 
          error: 'You must share a cliq to view this scrapbook' 
        }, { status: 403 });
      }
    }

    // Fetch scrapbook items (exclude expired unless pinned)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const items = await prisma.scrapbookItem.findMany({
      where: {
        profileId,
        OR: [
          { isPinned: true },
          { createdAt: { gte: ninetyDaysAgo } },
        ],
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[SCRAPBOOK_FETCH_ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to fetch scrapbook items' 
    }, { status: 500 });
  }
}