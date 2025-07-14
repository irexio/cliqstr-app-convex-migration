import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { resend } from '@/lib/email';

// Allow 1 reset request per 10 minutes per email
const RATE_LIMIT_MINUTES = 10;

export async function POST(req: Request) {
  const { email } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // Rate limiting: check audit log for recent requests
  const recent = await prisma.passwordResetAudit.findFirst({
    where: {
      email,
      event: 'requested',
      createdAt: { gt: new Date(Date.now() - 1000 * 60 * RATE_LIMIT_MINUTES) },
    },
  });
  if (recent) {
    // Log attempt (but don't send email)
    await prisma.passwordResetAudit.create({ data: { email, ip, event: 'rate_limited' } });
    return NextResponse.json({ success: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await prisma.passwordResetAudit.create({ data: { email, ip, event: 'requested' } });
    return NextResponse.json({ success: true }); // avoid leaking account existence
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: tokenHash,
      resetTokenExpires: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  await prisma.passwordResetAudit.create({ data: { email, ip, event: 'requested' } });

  const resetUrl = `https://cliqstr.com/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: 'Cliqstr <noreply@cliqstr.com>',
    to: email,
    subject: 'Reset your password',
    html: `<p>Click below to reset your password:</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>If you didn’t request this, you can safely ignore it.</p>`
  });

  return NextResponse.json({ success: true });
}
