import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

/**
 * API route for changing password when logged in
 */
export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: parsed.error.errors[0]?.message || 'Invalid input' 
      }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;
    
    console.log('🔐 [CHANGE-PASSWORD] Processing password change for user:', user.email);
    
    // Get the full user data with password
    const fullUser = await convexHttp.query(api.users.getUserForSignIn, { 
      email: user.email 
    });
    
    if (!fullUser || !fullUser.password) {
      console.log('❌ [CHANGE-PASSWORD] User not found or no password set');
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, fullUser.password);
    if (!isCurrentPasswordValid) {
      console.log('❌ [CHANGE-PASSWORD] Invalid current password');
      return NextResponse.json({ 
        error: 'Current password is incorrect' 
      }, { status: 400 });
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return NextResponse.json({ 
        error: 'New password must be different from current password' 
      }, { status: 400 });
    }
    
    // Hash the new password
    const hashedNewPassword = await hash(newPassword, 10);
    
    // Update user password
    await convexHttp.mutation(api.users.updateUser, {
      userId: user.id as any,
      updates: {
        password: hashedNewPassword,
      },
    });
    
    console.log('✅ [CHANGE-PASSWORD] Password changed successfully for user:', user.email);
    
    return NextResponse.json({ 
      success: true,
      message: 'Password changed successfully' 
    });
    
  } catch (error) {
    console.error('❌ [CHANGE-PASSWORD] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to change password' 
    }, { status: 500 });
  }
}
