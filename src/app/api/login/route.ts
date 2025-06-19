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
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // ✅ Step 1: Look up the user by email from the User model
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.profile || !user.profile.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ✅ Step 2: Compare passwords
    const isCorrectPassword = await compare(password, user.profile.password);

    if (!isCorrectPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ✅ Step 3: Sign JWT with user role info
    const token = signToken({
      userId: user.profile.id,
      role: user.profile.role,
      isApproved: user.profile.isApproved,
    });

    const res = NextResponse.json({ success: true, userId: user.profile.id });
    res.headers.set('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly`);

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
