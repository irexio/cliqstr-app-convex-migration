// 🔐 APA-HARDENED - Admin Force Password Reset API
// Only accessible by admin users, triggers password reset emails

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/token';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Admin API to force password reset for a user
 * POST /api/admin/force-password-reset
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin authorization
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify and decode the token
    const payload = verifyToken(token);
    
    if (!payload || payload.role !== 'Admin') {
      return NextResponse.json(
        { message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // 3. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Generate a reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // 5. Store the reset token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 6. Send the reset email
    // In a production environment, this would use a proper email service
    // For now, we'll log it to the console
    console.log(`
      ===== FORCE PASSWORD RESET EMAIL =====
      To: ${email}
      Subject: Cliqstr Password Reset
      
      Hello ${user.profile?.username || ''},
      
      Your password has been flagged for reset by an administrator.
      
      To set a new password, please click the link below:
      ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}
      
      This link will expire in 1 hour.
      
      If you did not request this password reset, please contact support immediately.
      
      Best regards,
      The Cliqstr Team
      ===================================
    `);

    // 7. Return success response
    return NextResponse.json({
      message: 'Password reset email sent successfully',
    });
  } catch (error: any) {
    console.error('Force password reset error:', error);
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
