/**
 * 📬 Invite Creation Endpoint — /api/invite/create
 *
 * 🔐 APA-Hardened: Ensures only authenticated cliq members can send invites.
 *
 * What this route does:
 * - Accepts cliqId, inviteeEmail, and invitedRole (child | adult | parent)
 * - Verifies the sender is an active member of the specified cliq
 * - Checks for duplicate invite requests to the same cliq + email
 * - Creates a new InviteRequest record in the database
 * - Sends a customized email to the invitee with a link to accept the invite
 * - Returns a `type` string to inform the frontend whether it was a direct invite or a request (child → parent approval)
 *
 * This route centralizes all invitation logic for:
 * - Cliq owners inviting adults or children
 * - Future support for invite messages (optional)
 * - Full email-based onboarding
 *
 * ⚠️ This route replaces `/api/cliqs/[id]/invite-post`
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';
import { sendInviteEmail } from '@/lib/auth/sendInviteEmail';

export const dynamic = 'force-dynamic';

const schema = z.object({
  cliqId: z.string(),
  inviteeEmail: z.string().email(),
  invitedRole: z.enum(['child', 'adult', 'parent']),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { cliqId, inviteeEmail, invitedRole } = parsed.data;

    // Check that current user is in the cliq
    const isMember = await prisma.membership.findFirst({
      where: { cliqId, userId: user.id },
    });

    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check for existing invite
    const existing = await prisma.inviteRequest.findFirst({
      where: { cliqId, inviteeEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'Invite already sent' }, { status: 409 });
    }

    const status = invitedRole === 'child' ? 'request' : 'invite';

    // Create InviteRequest
    await prisma.inviteRequest.create({
      data: {
        cliqId,
        inviterId: user.id,
        invitedRole,
        inviteeEmail,
        status,
        message: null, // Optional in future
      },
    });

    // Get cliq and inviter info
    const cliq = await prisma.cliq.findUnique({ where: { id: cliqId } });
    const inviter = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    if (!cliq || !inviter) {
      return NextResponse.json({ error: 'Missing cliq or inviter info' }, { status: 500 });
    }

    // Send invite email
    await sendInviteEmail({
      to: inviteeEmail,
      cliqName: cliq.name,
      inviterName: inviter.profile?.username || 'Someone you know',
      cliqId,
    });

    return NextResponse.json({ type: status });
  } catch (err) {
    console.error('❌ Invite creation error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
