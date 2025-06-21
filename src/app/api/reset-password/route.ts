// 🔐 APA-HARDENED RESET PASSWORD ENDPOINT
// This API route handles secure password updates via short-lived JWT token
// - Token is verified using APA-auth safe `verifyToken` method
// - Password is hashed with bcryptjs
// - No role manipulation or session creation
// Verified: 2025-06-21

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { hash } from 'bcryptjs';

type ResetPayload = {
  userId: string;
};

export async function POST(req: Request) {
  const body = await req.json();
  const { token, password } = body;

  // SECURITY: Validate token authenticity and payload shape
  const payload = verifyToken(token) as ResetPayload | null;

  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // SECURITY: Rehash the password with bcrypt (10 rounds)
  const hashedPassword = await hash(password, 10);

  // SECURITY: Update user password in Prisma (userId provided via JWT only)
  await prisma.user.update({
    where: { id: payload.userId },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}
