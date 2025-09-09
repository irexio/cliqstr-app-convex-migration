export const dynamic = 'force-dynamic';

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: GET /api/verify-email
 * 
 * This is the rewritten version using Convex patterns:
 * - Simplified email verification logic
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and easier to maintain
 * 
 * The client should use:
 * - useMutation(api.users.verifyUserEmail, { verificationToken }) for real-time updates
 * - This API route is kept for backward compatibility
 */

import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { verifyAccount } from '@/lib/auth/verifyAccount';

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

    try {
      // Verify email using Convex
      const userId = await convexHttp.mutation(api.users.verifyUserEmail, {
        verificationToken: codeHash,
      });

      // Call the existing verifyAccount function for additional logic
      await verifyAccount({ userId, method: 'email' });

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        userId,
      });

    } catch (error) {
      console.error('[VERIFY_EMAIL_ERROR]', error);
      
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired verification code',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
