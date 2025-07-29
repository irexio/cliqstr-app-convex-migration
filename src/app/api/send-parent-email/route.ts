/**
 * 🔐 APA-HARDENED ROUTE: POST /api/send-parent-email
 * 🛠️ INTERNAL USE ONLY
 *
 * Purpose:
 *   - Sends parent approval emails for child account creation
 *   - Internal helper route for invite flow
 *   - Not intended for direct external API calls
 *
 * Tags: Internal, Helper, Email
 * ⚠️ This is an internal helper route - use invite/create instead
 */

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
      plan, // expected: 'free' | 'paid' | 'ebt'
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

    // 🧪 Step 1: Validate invite
    const invite = await prisma.invite.findUnique({ where: { code: normalizeInviteCode(inviteCode) } });
    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid or used invite' }, { status: 400 });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    // 📥 Step 2: Get profile and user ID
    const childProfile = await prisma.myProfile.findUnique({
      where: { id: childId },
      select: { userId: true, birthdate: true }
    });

    if (!childProfile) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 400 });
    }

    // 🔒 Step 3: Update profile (set username + approval)
    await prisma.myProfile.update({
      where: { id: childId },
      data: {
        username,
      }
    });

    // 🔒 Step 3b: Update account approval status (APA: manual approval for EBT)
    await prisma.account.update({
      where: { userId: childProfile.userId },
      data: {
        isApproved: plan !== 'ebt', // EBT requires manual approval
      }
    });

    // 🔐 Step 4: Update user password
    await prisma.user.update({
      where: { id: childProfile.userId },
      data: {
        password: hashedPassword
      }
    });

    // 💳 Step 5: Create or update Account
    const existingAccount = await prisma.account.findUnique({
      where: { userId: childProfile.userId }
    });

    const planType = plan === 'paid' ? 'premium' : 'basic';

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          stripeStatus: plan,
          plan: planType
        }
      });
    } else {
      await prisma.account.create({
        data: {
          userId: childProfile.userId,
          birthdate: childProfile.birthdate || new Date('2010-01-01'), // Use child's actual birthdate
          role: 'Child',
          isApproved: plan !== 'ebt',
          stripeStatus: plan,
          plan: planType
        }
      });
    }

    // 📌 Step 6: Mark invite as used
    await prisma.invite.update({
      where: { code: normalizeInviteCode(inviteCode) },
      data: { status: 'used' }
    });

    // 👪 Step 7: Create ParentLink
    await prisma.parentLink.create({
      data: {
        childId: childProfile.userId,
        email: parentEmail
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PARENT_APPROVAL_COMPLETE_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
