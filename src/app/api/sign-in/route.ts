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
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        myProfile: true,
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
    
    // Check if adult user has verified their email
    // We determine this by checking if verificationToken exists
    // If token exists, they haven't verified their email yet
    if (user.account?.role?.toLowerCase() !== 'child' && user.verificationToken) {
      console.log('🚫 Sign-in denied - email not verified:', user.email);
      
      // Create response with headers to clear any legacy tokens
      const headers = new Headers();
      clearAuthTokens(headers);
      
      return NextResponse.json(
        { 
          error: 'Email not verified', 
          redirectUrl: '/verification-pending',
          email: user.email // Send back email for the verification pending page
        },
        { status: 403, headers }
      );
    }
    
    // Redirect unapproved users to complete signup
    // Check isApproved on both User and Account models for compatibility
    const isUserApproved = user.account?.isApproved ?? false;
    if (!isUserApproved) {
      console.log(`[⚠️] Unapproved user login — redirecting to onboarding: ${user.email}`);
      
      // Set session cookie to maintain authentication
      const response = NextResponse.json({
        success: true,
        redirectUrl: '/choose-plan',
        user: {
          id: user.id,
          role: user.account?.role || 'Adult',
        },
      });
      
      // Clear any legacy tokens
      clearAuthTokens(response.headers);
      
      // Set encrypted session
      const session = await getIronSession<SessionData>(req, response, sessionOptions);
      session.userId = user.id;
      session.createdAt = Date.now();
      await session.save();
      
      return response;
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

    // Set encrypted session
    const session = await getIronSession<SessionData>(req, response, sessionOptions);
    session.userId = user.id;
    session.createdAt = Date.now();
    await session.save();

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
