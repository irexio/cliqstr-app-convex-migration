export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { invalidateUser } from '@/lib/cache/userCache';

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
    try {
      const cookieStore = await cookies();
      const req2 = new Request('http://local', { headers: { cookie: cookieStore.toString() } });
      const res2 = new Response();
      const session = await getIronSession<SessionData>(req2 as any, res2 as any, sessionOptions);
      if (session && session.userId) {
        session.lastActivityAt = Date.now();
        await session.save();
        await invalidateUser(String(session.userId));
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[LEAVE_CLIQ_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


