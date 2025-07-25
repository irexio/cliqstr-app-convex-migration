/**
 * Email Verification API Endpoint
 * 
 * Purpose:
 * - Processes email verification tokens
 * - Marks accounts as verified when users click verification links
 * - Required verification (users must verify before accessing the app)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccount } from '@/lib/auth/verifyAccount';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Extract token from query params
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Verification code is missing',
      }, { status: 400 });
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
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired verification code',
      }, { status: 400 });
    }

    // Clear verification token and mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: null, // Clear verification token
        verificationExpires: null, // Clear expiry
        isVerified: true // Mark user as verified
      },
    });

    // Return JSON response instead of redirecting
    // The frontend will handle the redirect
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error during verification',
    }, { status: 500 });
  }
}
