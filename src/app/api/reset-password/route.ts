export const dynamic = 'force-dynamic';

// 🔐 APA-HARDENED RESET PASSWORD ENDPOINT
// Uses secure one-time reset codes (not persistent tokens) for password recovery
// Enforces APA requirements for user authentication

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { clearAuthTokens } from '@/lib/auth/enforceAPA';

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

    console.log('🔍 Looking for user with hashed reset code...');
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: { gte: new Date() },
      },
      include: {
        account: true // Include account to check role and approval status
      }
    });

    console.log('👤 User found with valid reset code:', !!user);
    console.log('⏰ Current time:', new Date().toISOString());

    if (!user) {
      const expiredUser = await prisma.user.findFirst({
        where: { resetToken: hashedToken },
        select: { resetTokenExpires: true, email: true },
      });

      if (expiredUser) {
        console.log('🕐 Found expired reset code. Expires at:', expiredUser.resetTokenExpires);
        console.log('📧 For email:', expiredUser.email);
      } else {
        console.log('❌ No user found with this reset code at all');
      }

      return NextResponse.json({ error: 'Reset code invalid or expired. Please request a new password reset.' }, { status: 400 });
    }
    
    // APA protection: deny if unapproved child
    // Check isApproved on both User and Account models for compatibility
    const isChildApproved = user.account?.isApproved ?? ('isApproved' in user ? user.isApproved : false);
    if (user.account?.role?.toLowerCase() === 'child' && !isChildApproved) {
      console.log('🚫 Reset denied - child not approved:', user.email);
      return NextResponse.json({ error: 'Password reset not allowed - account requires approval' }, { status: 403 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    console.log('🔄 Updating password for user:', user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,        // Delete the reset code
        resetTokenExpires: null, // Delete the expiration
      },
    });
    
    // Password is only stored on User model, not Profile
    console.log('✅ Password updated successfully');
    
    // Create response with headers to clear any auth tokens
    const headers = new Headers();
    clearAuthTokens(headers);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Password successfully updated. Please log in.' 
      }, 
      { headers }
    );
  } catch (err) {
    console.error('❌ Reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
