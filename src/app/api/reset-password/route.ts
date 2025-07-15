// 🔐 APA-HARDENED RESET PASSWORD ENDPOINT
// Uses secure one-time reset codes (not persistent tokens) for password recovery

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    console.log('🔍 Reset password request received');
    console.log('🎫 Reset code provided:', !!token);
    console.log('🔐 Password provided:', !!newPassword);

    if (!token || !newPassword) {
      console.log('❌ Missing reset code or password');
      return NextResponse.json({ error: 'Missing reset code or password' }, { status: 400 });
    }

    console.log('🔍 Looking for user with reset code...');
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gte: new Date() },
      },
    });

    console.log('👤 User found with valid reset code:', !!user);
    console.log('⏰ Current time:', new Date().toISOString());

    if (!user) {
      const expiredUser = await prisma.user.findFirst({
        where: { resetToken: token },
        select: { resetTokenExpires: true, email: true },
      });

      if (expiredUser) {
        console.log('🕐 Found expired reset code. Expires at:', expiredUser.resetTokenExpires);
        console.log('📫 For email:', expiredUser.email);
      } else {
        console.log('❌ No user found with this reset code at all');
      }

      return NextResponse.json({ error: 'Invalid or expired reset code. Please request a new password reset.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    console.log('🔄 Updating password for user:', user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
    
    // Password is only stored on User model, not Profile

    console.log('✅ Password updated successfully');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
