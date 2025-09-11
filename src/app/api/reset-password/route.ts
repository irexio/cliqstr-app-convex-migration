import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * API route for resetting password with token
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: parsed.error.errors[0]?.message || 'Invalid input' 
      }, { status: 400 });
    }

    const { token, newPassword } = parsed.data;
    
    console.log('🔐 [RESET-PASSWORD] Processing password reset with token');
    
    // Hash the token to match what's stored in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user by reset token
    const user = await convexHttp.query(api.users.getUserByResetToken, { 
      token: hashedToken 
    });
    
    if (!user) {
      console.log('❌ [RESET-PASSWORD] Invalid or expired reset token');
      return NextResponse.json({ 
        error: 'Invalid or expired reset token' 
      }, { status: 400 });
    }
    
    // Check if token has expired
    const now = Date.now();
    if (user.resetTokenExpires && user.resetTokenExpires < now) {
      console.log('❌ [RESET-PASSWORD] Reset token has expired');
      return NextResponse.json({ 
        error: 'Reset token has expired. Please request a new password reset.' 
      }, { status: 400 });
    }
    
    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);
    
    // Update user password and clear reset token
    await convexHttp.mutation(api.users.updateUser, {
      userId: user._id,
      updates: {
        password: hashedPassword,
        resetToken: undefined,
        resetTokenExpires: undefined,
      },
    });
    
    console.log('✅ [RESET-PASSWORD] Password reset successfully for user:', user.email);
    
    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully' 
    });
    
  } catch (error) {
    console.error('❌ [RESET-PASSWORD] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset password' 
    }, { status: 500 });
  }
}
