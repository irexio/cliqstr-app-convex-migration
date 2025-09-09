export const dynamic = 'force-dynamic';

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: POST /api/reset-password
 * 
 * This is the rewritten version using Convex patterns:
 * - Simplified password reset logic
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and easier to maintain
 * 
 * The client should use:
 * - useMutation(api.users.resetUserPassword, { resetToken, newPassword }) for real-time updates
 * - This API route is kept for backward compatibility
 */

import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { clearAuthTokens } from '@/lib/auth/enforceAPA';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // Extract token from URL if present
    const { searchParams } = new URL(req.url);
    const codeFromUrl = searchParams.get('code');
    
    // Get token and password from request body
    const body = await req.json();
    const rawToken = body.token || codeFromUrl;
    const { newPassword } = body;

    console.log('🔍 Reset password request received');
    console.log('🎫 Reset code provided:', !!rawToken);
    console.log('🔐 Password provided:', !!newPassword);

    if (!rawToken || !newPassword) {
      console.log('❌ Missing reset code or password');
      return NextResponse.json({ error: 'Missing reset code or password' }, { status: 400 });
    }
    
    // Hash the token before querying the database
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    console.log('🔒 Hashed token for database lookup');

    try {
      // Reset password using Convex
      const userId = await convexHttp.mutation(api.users.resetUserPassword, {
        resetToken: hashedToken,
        newPassword: newPassword,
      });

      console.log('✅ Password reset successful for user:', userId);

      // Clear the reset token from the database for security
      await convexHttp.mutation(api.users.updateUser, {
        userId: userId as any,
        updates: {
          resetToken: undefined,
          resetTokenExpires: undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
        userId,
      });

    } catch (error) {
      console.error('❌ Password reset failed:', error);
      
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired reset code',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
