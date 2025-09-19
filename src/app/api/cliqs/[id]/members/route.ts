export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { bumpActivityAndInvalidate } from '@/lib/session-activity';

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
    await bumpActivityAndInvalidate();

    return NextResponse.json({ members: members ?? [] });
  } catch (err) {
    console.error('[GET_CLIQ_MEMBERS_ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}


