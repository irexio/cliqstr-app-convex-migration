export const dynamic = 'force-dynamic';

/**
 * 🚨 DEPRECATED: This route has been rewritten with Convex optimizations
 * 
 * Use: /api/cliqs/feed/route-convex.ts instead
 * 
 * The new version:
 * - Uses optimized Convex queries instead of heavy Prisma includes
 * - More efficient and enables real-time updates
 * - Client should use useQuery(api.posts.getPostsForCliqFeed, { cliqId }) for live updates
 * 
 * @deprecated Use route-convex.ts instead
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
    
    // 🔒 Security check: User must have a valid plan (including 'test' for now)
    if (!user.plan) {
      console.error('[SECURITY] User attempted cliq access without plan:', {
        userId: user.id,
        email: user.email,
        role: user.role
      });
      return NextResponse.json({ error: 'Account setup incomplete - no plan assigned' }, { status: 403 });
    }

    // APA-compliant access control: Verify user is a member of this cliq
    try {
      await requireCliqMembership(user.id, cliqId);
    } catch (error) {
      return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
    }

    const posts = await convexHttp.query(api.posts.getPostsForCliqFeed, {
      cliqId: cliqId as any,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('❌ Error loading cliq feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
