// 🔐 APA-HARDENED ROUTE: POST /api/parent/approval-complete
// Finalizes child account setup after parent approval (invite or direct sign-up)

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';

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
      const invite = await prisma.invite.findUnique({ where: { code: normalizeInviteCode(inviteCode) } });

      if (!invite || invite.status !== 'pending') {
        return NextResponse.json({ error: 'Invalid or used invite' }, { status: 400 });
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
      }

      await prisma.invite.update({
        where: { code: normalizeInviteCode(inviteCode) },
        data: { status: 'used' },
      });
    }

    const hashedPassword = await hash(password, 10);

    // ✅ Get profile and its userId
    const childProfile = await prisma.myProfile.findUnique({
      where: { id: childId },
      select: { userId: true }
    });
    
    if (!childProfile) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 400 });
    }

    // Update profile
    await prisma.myProfile.update({
      where: { id: childId },
      data: {
        username,
      },
    });

    // Update account approval status (APA: manual approval for EBT)
    await prisma.account.update({
      where: { userId: childProfile.userId },
      data: {
        isApproved: plan !== 'ebt',
      },
    });
    
    // Update user password
    await prisma.user.update({
      where: { id: childProfile.userId },
      data: {
        password: hashedPassword
      }
    });
    
    // Create or update account with subscription data
    const existingAccount = await prisma.account.findUnique({
      where: { userId: childProfile.userId }
    });
    
    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          stripeStatus: plan,
          plan: plan === 'paid' ? 'premium' : 'basic'
        }
      });
    } else {
      await prisma.account.create({
        data: {
          userId: childProfile.userId,
          role: 'Child',
          isApproved: plan !== 'ebt',
          stripeStatus: plan,
          plan: plan === 'paid' ? 'premium' : 'basic'
        }
      });
    }

    await prisma.parentLink.create({
      data: {
        childId: childProfile.userId,
        email: parentEmail,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PARENT_APPROVAL_COMPLETE_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
