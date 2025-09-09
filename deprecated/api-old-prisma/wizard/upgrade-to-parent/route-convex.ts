export const dynamic = 'force-dynamic';

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: POST /api/wizard/upgrade-to-parent
 * 
 * This is the rewritten version using Convex patterns:
 * - Simplified upgrade to parent logic
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and easier to maintain
 * 
 * The client should use:
 * - useMutation(api.users.upgradeToParent, { userId }) for real-time updates
 * - This API route is kept for backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/getServerSession';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    // Auth: user must be authenticated
    const session = await getServerSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      // Upgrade to parent using Convex
      await convexHttp.mutation(api.users.upgradeToParent, {
        userId: session.id as any,
      });

      return NextResponse.json({ ok: true });

    } catch (error) {
      console.error('[UPGRADE_TO_PARENT_ERROR]', error);
      
      if (error instanceof Error) {
        if (error.message === "Account not found") {
          return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }
        if (error.message === "Already a parent account") {
          return NextResponse.json({ error: 'Already a parent account' }, { status: 400 });
        }
        if (error.message === "Child accounts cannot become parents") {
          return NextResponse.json({ error: 'Child accounts cannot become parents' }, { status: 400 });
        }
      }
      
      return NextResponse.json({ error: 'Failed to upgrade to parent' }, { status: 500 });
    }

  } catch (error) {
    console.error('[UPGRADE_TO_PARENT_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
