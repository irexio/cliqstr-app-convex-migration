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

  const payload = verifyToken(token) as ResetPayload | null;

  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const hashedPassword = await hash(password, 10);

  await prisma.user.update({
    where: { id: payload.userId },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}
