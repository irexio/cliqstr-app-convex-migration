export const dynamic = 'force-dynamic';

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
import { verifyAccount } from '@/lib/auth/verifyAccount';

export async function GET(req: Request) {
  try {
    // Extract token from query params
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-error?reason=missing-code`);
    }

    const codeHash = require('crypto').createHash('sha256').update(code).digest('hex');

    // Look up user by hashed code and expiry
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: codeHash,
        verificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-error?reason=invalid-or-expired-code`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isApproved: true, // or whatever flag marks as verified
        verificationToken: null,
        verificationExpires: null,
      },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-success`);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verification-error?reason=server-error`);
  }
}
