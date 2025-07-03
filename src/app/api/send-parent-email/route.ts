/**
 * 🔐 APA-HARDENED ROUTE: DO NOT DELETE POST /api/parent/approval-complete
 *
 * Purpose:
 *   - Completes a child's signup after parental approval
 *   - Hashes password, sets username, sets plan
 *   - Creates ParentLink between parent + child
 *   - Updates invite status to 'used'
 * // 🔐 APA-HARDENED — DO NOT DELETE OR IMPORT THIS FILE DIRECTLY
  *   - Validates invite code, checks expiration
 */

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      inviteCode,
      childId,
      username,
      password,
      parentEmail,
      plan, // 'free', 'paid', 'ebt'
    } = body;

    if (
      !inviteCode ||
      !childId ||
      !username ||
      !password ||
      !parentEmail ||
      !plan ||
      !['free', 'paid', 'ebt'].includes(plan)
    ) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Validate invite
    const invite = await prisma.invite.findUnique({ where: { code: inviteCode } });
    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid or used invite' }, { status: 400 });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    // Update child profile
    await prisma.profile.update({
      where: { id: childId },
      data: {
        username,
        password: hashedPassword,
        isApproved: plan !== 'ebt', // EBT requires manual approval
        stripeStatus: plan,
      },
    });

    // Mark invite as used
    await prisma.invite.update({
      where: { code: inviteCode },
      data: { status: 'used' },
    });

    // Create ParentLink
    await prisma.parentLink.create({
      data: {
        childId,
        email: parentEmail,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PARENT_APPROVAL_COMPLETE_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
