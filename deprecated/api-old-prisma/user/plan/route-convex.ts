export const dynamic = 'force-dynamic';

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: POST /api/user/plan
 * 
 * This is the rewritten version using Convex patterns:
 * - Simplified plan update logic
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and easier to maintain
 * 
 * The client should use:
 * - useMutation(api.users.updateUserPlan, { userId, plan }) for real-time updates
 * - This API route is kept for backward compatibility
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.error('[PLAN_API] No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { plan } = await req.json();
    
    if (!plan) {
      console.error('[PLAN_API] Missing plan in request');
      return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
    }
    
    console.log(`[PLAN_API] Processing plan selection: ${plan} for user ${user.id}`);
    
    // Update plan using Convex
    await convexHttp.mutation(api.users.updateUserPlan, {
      userId: user.id as any,
      plan: plan,
    });
    
    console.log(`[PLAN_API] Successfully updated plan to ${plan} for user ${user.id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Plan updated successfully',
      plan 
    });
    
  } catch (error) {
    console.error('[PLAN_API] Error updating plan:', error);
    return NextResponse.json({ 
      error: 'Failed to update plan' 
    }, { status: 500 });
  }
}
