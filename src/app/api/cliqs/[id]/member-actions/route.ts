export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { invalidateUser } from '@/lib/cache/userCache';

const BodySchema = z.object({
  targetUserId: z.string().min(1),
  action: z.enum(['promote', 'demote', 'remove']),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cliqId } = await params;
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    const { targetUserId, action } = parsed.data;

    // Ensure current user is cliq owner
    const cliq = await convexHttp.query(api.cliqs.getCliqBasic, { cliqId: cliqId as any });
    if (!cliq || String(cliq.ownerId) !== String(user.id)) {
      return NextResponse.json({ error: 'Only owner can manage members' }, { status: 403 });
    }

    if (action === 'remove') {
      await convexHttp.mutation(api.memberships.removeMember, {
        userId: targetUserId as any,
        cliqId: cliqId as any,
        updatedBy: user.id as any,
      });
    } else {
      const newRole = action === 'promote' ? 'Moderator' : 'Member';
      await convexHttp.mutation(api.memberships.updateMemberRole, {
        userId: targetUserId as any,
        cliqId: cliqId as any,
        newRole,
        updatedBy: user.id as any,
      });
    }

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
    console.error('[MEMBER_ACTIONS_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


