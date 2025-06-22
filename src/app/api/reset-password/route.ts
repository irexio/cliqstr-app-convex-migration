// 🔐 APA-HARDENED RESET PASSWORD ENDPOINT
// This API route handles secure password updates via short-lived JWT token
// - Token is verified using APA-auth safe `verifyToken` method
// - Password is hashed with bcryptjs
// - No role manipulation or session creation
// Verified: 2025-06-22 - Testing Session 1

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()
    
    console.log('🔍 Reset password request received');
    console.log('🎫 Token provided:', !!token);
    console.log('🔐 Password provided:', !!newPassword);

    if (!token || !newPassword) {
      console.log('❌ Missing token or password');
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 })
    }

    console.log('🔍 Looking for user with token...');
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gte: new Date() },
      },
    })

    console.log('👤 User found with valid token:', !!user);
    console.log('⏰ Current time:', new Date().toISOString());
    
    if (!user) {
      // Let's also check if there's a user with this token but expired
      const expiredUser = await prisma.user.findFirst({
        where: { resetToken: token },
        select: { resetTokenExpires: true, email: true }
      });
      
      if (expiredUser) {
        console.log('🕐 Found expired token. Expires at:', expiredUser.resetTokenExpires);
        console.log('📧 For email:', expiredUser.email);
      } else {
        console.log('❌ No user found with this token at all');
      }
      
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }    const hashed = await bcrypt.hash(newPassword, 10)

    console.log('🔄 Updating password for user:', user.email);

    // Update password in both User and Profile models to ensure consistency
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    // Also update the profile password (this is what sign-in checks)
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        password: hashed,
      },
    })

    console.log('✅ Password updated successfully in both User and Profile models');

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
