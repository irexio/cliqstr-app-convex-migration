export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cliqId } = await params;
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch members via Convex
    const members = await convexHttp.query(api.cliqs.getCliqMembers, {
      cliqId: cliqId as any,
    });

    // Count this as activity
    try {
      const cookieStore = await cookies();
      const req2 = new Request('http://local', { headers: { cookie: cookieStore.toString() } });
      const res2 = new Response();
      const session = await getIronSession<SessionData>(req2 as any, res2 as any, sessionOptions);
      if (session && session.userId) {
        session.lastActivityAt = Date.now();
        await session.save();
      }
    } catch {}

    return NextResponse.json({ members: members ?? [] });
  } catch (err) {
    console.error('[GET_CLIQ_MEMBERS_ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}


