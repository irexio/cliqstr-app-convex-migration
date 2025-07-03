export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { signToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isCorrectPassword = await compare(password, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 🔒 Check if child account is approved
    if (user.profile?.role === 'child' && !user.profile?.isApproved) {
      return NextResponse.json(
        { error: 'Awaiting parent approval' },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      role: user.profile?.role || 'adult',
      isApproved: user.profile?.isApproved || false,
    });

    // Handle cookies as they may be async in newer Next.js versions
    const cookieStore = await Promise.resolve(cookies());
    cookieStore.set('auth_token', token, {
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
