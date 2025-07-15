/**
 * 🔐 APA-SAFE LOGIN ROUTE — FINAL VERSION
 *
 * Authenticates user with email/password,
 * verifies child approval,
 * issues secure session cookie via NextResponse headers.
 *
 * ✅ No persistent tokens used
 * ✅ Role and approval validation
 * ✅ Secure session-based auth only
 * ✅ Legacy tokens cleared
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { clearAuthTokens } from '@/lib/auth/enforceAPA';

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
        account: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isCorrectPassword = await compare(password, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 🔒 Block unapproved children (APA: check Account, not Profile)
    if (user.account?.role?.toLowerCase() === 'child' && !user.account?.isApproved) {
      console.log('🚫 Sign-in denied - child not approved:', user.email);
      
      // Create response with headers to clear any legacy tokens
      const headers = new Headers();
      clearAuthTokens(headers);
      
      return NextResponse.json(
        { error: 'Awaiting parent approval', redirectUrl: '/awaiting-approval' },
        { status: 403, headers }
      );
    }

    //  Set secure session cookie with user.id (APA-compliant)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.account?.role || 'Adult',
      },
    });
    
    // Clear any legacy tokens that might exist
    clearAuthTokens(response.headers);

    response.cookies.set({
      name: 'session',
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

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
