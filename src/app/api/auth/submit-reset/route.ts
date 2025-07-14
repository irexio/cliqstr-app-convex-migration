import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const reset = await prisma.passwordReset.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: { account: true },
  });

  if (!reset || !reset.account) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.account.update({
    where: { id: reset.accountId },
    data: { password: hashedPassword },
  });

  await prisma.passwordReset.delete({ where: { id: reset.id } });

  // Audit log
  await prisma.passwordResetAudit.create({ data: { email: reset.account.email, ip, event: 'completed' } });

  return NextResponse.json({ success: true });
}
