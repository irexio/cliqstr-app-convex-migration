export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { signToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.profile || !user.profile.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isCorrectPassword = await compare(password, user.profile.password);

    if (!isCorrectPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ✅ Create session token
    const token = signToken({
      userId: user.profile.id,
      role: user.profile.role,
      isApproved: user.profile.isApproved,
    });

    // ✅ Set secure HttpOnly cookie
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly`);

    return response;
  } catch (err) {
    console.error('Sign-in error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
