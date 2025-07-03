// 🔐 APA-HARDENED ROUTE: POST /api/parent/approval-complete
// Finalizes child account setup after parent approval (invite or direct sign-up)

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
      plan,
    } = body;

    if (
      !childId ||
      !username ||
      !password ||
      !parentEmail ||
      !plan ||
      !['free', 'paid', 'ebt'].includes(plan)
    ) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // ✅ Optional invite logic
    if (inviteCode) {
      const invite = await prisma.invite.findUnique({ where: { code: inviteCode } });

      if (!invite || invite.status !== 'pending') {
        return NextResponse.json({ error: 'Invalid or used invite' }, { status: 400 });
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
      }

      await prisma.invite.update({
        where: { code: inviteCode },
        data: { status: 'used' },
      });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.profile.update({
      where: { id: childId },
      data: {
        username,
        password: hashedPassword,
        isApproved: plan !== 'ebt',
        stripeStatus: plan,
      },
    });

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
