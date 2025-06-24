export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies as getCookies } from 'next/headers';
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

    // ✅ Create token using actual User ID
    const token = signToken({
      userId: user.id,
      role: user.profile.role,
      isApproved: user.profile.isApproved,
    });

    // ✅ Set cookie (TypeScript-safe workaround)
    const cookieStore = getCookies();
    (cookieStore as any).set('auth_token', token, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('💥 Sign-in error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
