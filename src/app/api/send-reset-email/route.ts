export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth/jwt';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const token = signToken({
      userId: user.profile.id,
      role: user.profile.role,
      isApproved: user.profile.isApproved,
    }); // ✅ Fully matches TokenPayload

    const resetLink = `https://cliqstr.com/reset-password?token=${token}`;

    await resend.emails.send({
      to: email,
      from: 'support@cliqstr.com',
      subject: 'Reset Your Cliqstr Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send reset email error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
