export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

// GET /api/parent/children/[id]
// Returns child basic info + settings if the child is linked to the current parent
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parent = await getCurrentUser();
    if (!parent?.id || !parent?.email) {
      return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
    }

    const childId = params.id;
    console.log('[PARENTS_HQ][child-info] start', { parentId: parent.id, childId });

    // Ensure parent is linked to this child
    const link = await prisma.parentLink.findFirst({ where: { email: parent.email, childId } });
    if (!link) {
      return NextResponse.json({ ok: false, reason: 'not_linked_to_parent' }, { status: 403 });
    }

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: {
        id: true,
        email: true,
        myProfile: { select: { id: true, username: true } },
      },
    });

    if (!child) {
      return NextResponse.json({ ok: false, reason: 'child_not_found' }, { status: 404 });
    }

    const settings = await prisma.childSettings.findUnique({
      where: { profileId: child.myProfile?.id || '' },
    });

    return NextResponse.json({
      id: child.id,
      username: child.myProfile?.username || undefined,
      email: child.email,
      settings: settings || {
        canCreatePublicCliqs: false,
        canJoinPublicCliqs: false,
        canCreateCliqs: false,
        canSendInvites: false,
        canInviteChildren: false,
        canInviteAdults: false,
        isSilentlyMonitored: true,
        canAccessGames: false,
        canPostImages: true,
        canShareYouTube: false,
        inviteRequiresApproval: true,
      },
    });
  } catch (err) {
    console.error('[PARENTS_HQ][child-info] error', err);
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 });
  }
}
