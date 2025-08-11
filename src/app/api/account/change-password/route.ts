import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    // Fetch user with password for verification
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    });

    if (!userWithPassword) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, userWithPassword.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      return NextResponse.json({ error: 'New password must contain at least one lowercase letter' }, { status: 400 });
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      return NextResponse.json({ error: 'New password must contain at least one uppercase letter' }, { status: 400 });
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      return NextResponse.json({ error: 'New password must contain at least one number' }, { status: 400 });
    }

    // Check if new password is different from current
    const isSamePassword = await compare(newPassword, userWithPassword.password);
    if (isSamePassword) {
      return NextResponse.json({ error: 'New password must be different from current password' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
