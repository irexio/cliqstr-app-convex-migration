export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      inviteCode,
      childId,
      username,
      password,
      parentEmail,
      plan, // now supports: 'free', 'paid', 'ebt'
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

    // ✅ Validate the invite
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
    });

    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid or used invite' }, { status: 400 });
    }

    // ✅ Check expiration
    const now = new Date();
    if (invite.expiresAt && new Date(invite.expiresAt) < now) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    // ✅ Placeholder for Stripe or manual EBT verification
    const paymentSuccess = true; // Will later depend on actual Stripe or manual approval
    if (!paymentSuccess) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    // ✅ Update child profile
    await prisma.profile.update({
      where: { id: childId },
      data: {
        username,
        password: hashedPassword,
        isApproved: plan === 'ebt' ? false : true, // Manual approval for EBT
        stripeStatus: plan, // 'free', 'paid', or 'ebt'
      },
    });

    // ✅ Mark invite as used
    await prisma.invite.update({
      where: { code: inviteCode },
      data: { status: 'used' },
    });

    // ✅ Create ParentLink
    await prisma.parentLink.create({
      data: {
        childId,
        email: parentEmail,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Complete approval error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
