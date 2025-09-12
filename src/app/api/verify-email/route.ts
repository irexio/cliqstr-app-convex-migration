import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import crypto from 'crypto';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const verifyEmailSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});

/**
 * API route for verifying email with verification code
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ 
        error: 'Verification code is required' 
      }, { status: 400 });
    }

    const parsed = verifyEmailSchema.safeParse({ code });

    if (!parsed.success) {
      return NextResponse.json({ 
        error: parsed.error.errors[0]?.message || 'Invalid verification code' 
      }, { status: 400 });
    }
    
    console.log('📧 [VERIFY-EMAIL] Processing email verification with code');
    
    // Hash the code to match what's stored in the database
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    
    // Find user by verification token
    const user = await convexHttp.query(api.users.getUserByVerificationToken, { 
      token: hashedCode 
    });
    
    if (!user) {
      console.log('❌ [VERIFY-EMAIL] Invalid verification code');
      return NextResponse.json({ 
        error: 'Invalid or expired verification code' 
      }, { status: 400 });
    }
    
    // Check if verification has expired
    const now = Date.now();
    if (user.verificationExpires && user.verificationExpires < now) {
      console.log('❌ [VERIFY-EMAIL] Verification code has expired');
      return NextResponse.json({ 
        error: 'Verification code has expired. Please request a new verification email.' 
      }, { status: 400 });
    }
    
    // Check if user is already verified
    if (user.isVerified) {
      console.log('✅ [VERIFY-EMAIL] User already verified:', user.email);
      return NextResponse.json({ 
        success: true,
        message: 'Email already verified' 
      });
    }
    
    // Mark user as verified and clear verification token
    await convexHttp.mutation(api.users.updateUser, {
      userId: user._id,
      updates: {
        isVerified: true,
        verificationToken: undefined,
        verificationExpires: undefined,
      },
    });
    
    console.log('✅ [VERIFY-EMAIL] Email verified successfully for user:', user.email);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully' 
    });
    
  } catch (error) {
    console.error('❌ [VERIFY-EMAIL] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to verify email' 
    }, { status: 500 });
  }
}
