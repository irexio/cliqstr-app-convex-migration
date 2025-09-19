export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { bumpActivityAndInvalidate } from '@/lib/session-activity';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cliqId } = await params;
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await convexHttp.mutation(api.memberships.leaveCliq, {
      userId: user.id as any,
      cliqId: cliqId as any,
    });

    // Bump activity and invalidate cache
    await bumpActivityAndInvalidate();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[LEAVE_CLIQ_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


