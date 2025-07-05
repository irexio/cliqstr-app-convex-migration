/**
 * 🔐 APA-SAFE LOGIN ROUTE — FINAL VERSION
 *
 * Authenticates user with email/password,
 * verifies child approval,
 * issues secure auth_token cookie via NextResponse headers.
 *
 * ✅ No .set() usage (fixes error)
 * ✅ Secure cookie
 * ✅ Works with getCurrentUser
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
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

    // 🔒 Block unapproved children
    if (user.profile?.role === 'Child' && !user.profile?.isApproved) {
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

    // ✅ Set secure auth_token cookie via header (not .set)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.profile?.role || 'Adult',
      },
    });

    response.headers.append(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
        60 * 60 * 24 * 7
      }; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
    );

    return response;
  } catch (err) {
    console.error('💥 Sign-in error:', err);

    if (err instanceof Error) {
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }

    return NextResponse.json(
      { error: 'Unable to sign in. Please try again later.' },
      { status: 500 }
    );
  }
}
