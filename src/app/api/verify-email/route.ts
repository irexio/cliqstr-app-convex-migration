/**
 * Email Verification API Endpoint
 * 
 * Purpose:
 * - Processes email verification tokens
 * - Marks accounts as verified when users click verification links
 * - Non-blocking verification (users can still access the app before verifying)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, TokenPayload } from '@/lib/auth/jwt';
import { verifyAccount } from '@/lib/auth/verifyAccount';

export async function GET(req: Request) {
  try {
    // Extract token from query params
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-error?reason=missing-token`);
    }

    // Verify the token
    const payload = verifyToken(token) as TokenPayload | null;
    
    if (!payload || payload.purpose !== 'email_verification' || !payload.userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-error?reason=invalid-token`);
    }

    // Use the common verification helper
    const result = await verifyAccount({
      userId: payload.userId,
      method: 'email'
    });

    if (!result.success) {
      // Redirect to error page with appropriate message
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-error?reason=${encodeURIComponent(result.message)}`);
    }

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-success`);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-error?reason=server-error`);
  }
}
