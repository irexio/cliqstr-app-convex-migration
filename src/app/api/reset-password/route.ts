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
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const payload = verifyToken(token) as ResetPayload | null;

    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
