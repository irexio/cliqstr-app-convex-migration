/**
 * 🔄 OPTIMIZED CONVEX ROUTE: GET /api/scrapbook/[profileId]
 * 
 * This is the rewritten version using Convex patterns:
 * - Fetches scrapbook items using optimized Convex queries
 * - More efficient than the original Prisma version
 * - Enables real-time updates for scrapbook changes
 * 
 * @deprecated The original route.ts is deprecated in favor of this Convex version
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from '../../../../../convex/_generated/api';

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

    // Get the profile and its owner using Convex
    const profile = await convexHttp.query(api.profiles.getProfileByUserId, {
      userId: profileId as any, // This should be the profile owner's userId
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if users share a cliq (unless viewing own profile)
    if (profile.userId !== user.id) {
      const hasSharedCliq = await convexHttp.query(api.profiles.checkSharedCliqMembership, {
        userId1: user.id as any,
        userId2: profile.userId as any,
      });
      
      if (!hasSharedCliq) {
        return NextResponse.json({ 
          error: 'You must share a cliq to view this scrapbook' 
        }, { status: 403 });
      }
    }

    // Fetch scrapbook items using Convex
    const items = await convexHttp.query(api.scrapbook.getScrapbookItems, {
      profileId: profileId as any,
      includeExpired: false, // Exclude expired items unless pinned
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[SCRAPBOOK_FETCH_ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to fetch scrapbook items' 
    }, { status: 500 });
  }
}
