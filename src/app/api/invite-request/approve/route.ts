export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: POST /api/invite-request/approve
 *
 * Purpose:
 *   - Allows a verified parent or adult to approve a pending invite request
 *     (usually submitted by a child user or system-initiated invite)
 *
 * Features:
 *   - Authenticates the current user
 *   - Ensures only adults (non-child profiles) can approve
 *   - Fetches the original inviteRequest by ID
 *   - Creates a new invite with `isApproved: true`
 *   - Deletes the original pending request
 *
 * Used In:
 *   - Parent HQ or email approval flow for child invites
 *   - Admin dashboard (future: moderation review tools)
 *
 * Related Routes:
 *   - /api/invite/create → creates invite or inviteRequest depending on role
 *   - /api/validate-invite → used during sign-up
 *
 * Completion:
 *   ✅ Fully live and APA-compliant as of June 30, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { generateInviteCode } from '@/lib/auth/generateInviteCode';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Enforce parent or adult role only
    const profile = await prisma.myProfile.findUnique({
      where: { userId: user.id },
    });
    const account = await prisma.account.findUnique({ where: { userId: user.id } });

    if (!profile || !account || account.role === 'Child') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const inviteRequest = await prisma.inviteRequest.findUnique({
      where: { id: requestId },
    });

    if (!inviteRequest) {
      return NextResponse.json({ error: 'Invite request not found' }, { status: 404 });
    }

    // Create approved invite
    await prisma.invite.create({
      data: {
        code: await generateInviteCode(),
        cliqId: inviteRequest.cliqId,
        invitedRole: inviteRequest.invitedRole,
        inviteeEmail: inviteRequest.inviteeEmail,
        inviterId: inviteRequest.inviterId,
        status: 'pending',
        isApproved: true,
        maxUses: 1,
        used: false,
      },
    });

    // Delete the original request
    await prisma.inviteRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error approving invite request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
