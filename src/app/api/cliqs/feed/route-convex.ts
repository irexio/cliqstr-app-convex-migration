export const dynamic = 'force-dynamic';

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: GET /api/cliqs/feed?id={cliqId}
 * 
 * This is the rewritten version using Convex patterns:
 * - Returns posts with basic author info (no heavy includes)
 * - More efficient than the original Prisma version
 * - Client can use real-time Convex queries for live updates
 * 
 * The client should use:
 * - useQuery(api.posts.getPostsForCliqFeed, { cliqId }) for real-time updates
 * - This API route is kept for backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { isValidPlan } from '@/lib/utils/planUtils';
import { convexHttp } from '@/lib/convex-server';
import { api } from '../../../../convex/_generated/api';
import { requireCliqMembership } from '@/lib/auth/requireCliqMembership';

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

    // Simplified plan validation
    if (!user.account?.plan || !isValidPlan(user.account.plan)) {
      console.log('[APA] User missing or invalid plan in cliq feed route');
      return NextResponse.json({ error: 'Account setup incomplete - no plan assigned' }, { status: 403 });
    }

    // APA-compliant access control: Verify user is a member of this cliq
    try {
      await requireCliqMembership(user.id, cliqId);
    } catch (error) {
      return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
    }

    // Get posts with optimized Convex query
    const posts = await convexHttp.query(api.posts.getPostsForCliqFeed, {
      cliqId: cliqId as any,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('❌ Error loading cliq feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
