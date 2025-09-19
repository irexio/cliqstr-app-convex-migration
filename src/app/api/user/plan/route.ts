import { NextResponse, NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { z } from 'zod';
import { invalidateUser } from '@/lib/cache/userCache';

export const dynamic = 'force-dynamic';

const planSchema = z.object({
  plan: z.string().min(1, 'Plan is required'),
});

/**
 * POST /api/user/plan
 * 
 * Updates the user's plan selection
 * For test plans, this directly updates the Account record
 * For paid plans, this would normally redirect to Stripe
 */
export async function POST(req: NextRequest) {
  try {
    // Access session for auth check (no cookie write yet)
    const session = await getIronSession<SessionData>(
      req,
      NextResponse.next(),
      sessionOptions
    );

    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = planSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: parsed.error.errors[0]?.message || 'Invalid plan data' 
      }, { status: 400 });
    }

    const { plan } = parsed.data;

    console.log(`[PLAN-UPDATE] Updating plan for user ${session.userId} to: ${plan}`);

    // Get the user's account
    const user = await convexHttp.query(api.users.getCurrentUser, {
      userId: session.userId as any,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user's plan (users table)
    await convexHttp.mutation(api.users.updateUserPlan, {
      userId: session.userId as any,
      plan: plan,
    });

    // Mirror plan into Account and approve
    await convexHttp.mutation(api.accounts.updateAccount, {
      userId: session.userId as any,
      updates: {
        plan: plan,
        isApproved: true,
      },
    });

    // Invalidate user cache after plan/approval change
    await invalidateUser(String(session.userId));

    console.log(`[PLAN-UPDATE] Successfully updated plan to: ${plan}`);

    // Build response first so cookie save attaches to same response
    const response = NextResponse.json({
      success: true,
      message: 'Plan updated successfully',
      plan: plan,
    });

    // Bump session activity and persist cookie on same response
    try {
      const sess = await getIronSession<SessionData>(req, response, sessionOptions);
      if (sess) {
        sess.lastActivityAt = Date.now();
        await sess.save();
      }
    } catch {}

    return response;

  } catch (error) {
    console.error('[PLAN-UPDATE] Error updating plan:', error);
    return NextResponse.json({ 
      error: 'Failed to update plan' 
    }, { status: 500 });
  }
}
