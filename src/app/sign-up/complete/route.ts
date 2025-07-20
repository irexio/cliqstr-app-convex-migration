// 🔐 APA-HARDENED — Finalize profile for invited user
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CompleteSignupSchema = z.object({
  userId: z.string(),
  username: z.string().min(3).max(15).regex(/^[a-zA-Z0-9_]+$/),
  birthdate: z.string(),
  inviteCode: z.string(),
  cliqId: z.string(),
  invitedRole: z.enum(['child', 'adult', 'parent']),
  image: z.string().url().optional(),
  bannerImage: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CompleteSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const {
      userId,
      username,
      birthdate,
      inviteCode,
      cliqId,
      invitedRole,
      image,
      bannerImage,
    } = parsed.data;

    if (user.id !== userId) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
    }

    const invite = await prisma.invite.findUnique({
      where: { code: normalizeInviteCode(inviteCode) },
    });

    if (!invite || invite.cliqId !== cliqId) {
      return NextResponse.json({ error: 'Invalid or mismatched invite' }, { status: 404 });
    }

    // Update profile
    await prisma.profile.update({
      where: { userId },
      data: {
        username,
        birthdate: new Date(birthdate),
        image,
        bannerImage,
      },
    });

    // Create membership
    await prisma.membership.create({
      data: {
        cliqId,
        userId,
        role: 'Member', // Default to Member role for all invited users regardless of their user role
      },
    });

    // Optionally: delete or mark invite as used
    await prisma.invite.delete({
      where: { code: normalizeInviteCode(inviteCode) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Signup complete error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
