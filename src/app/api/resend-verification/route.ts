import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/auth/sendVerificationEmail';

// Define validation schema
const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = resendVerificationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    
    if (!user) {
      // Don't reveal that the email doesn't exist for security reasons
      return NextResponse.json(
        { success: true, message: 'If your email exists in our system, a verification link has been sent.' },
        { status: 200 }
      );
    }
    
    // Check if already verified by checking the verification token
    // If there's no token, they're already verified
    if (!user.verificationToken) {
      return NextResponse.json(
        { success: true, message: 'Your email is already verified. Please sign in.' },
        { status: 200 }
      );
    }
    
    // Send verification email
    await sendVerificationEmail({
      userId: user.id,
      to: email,
      name: user.profile?.firstName || ''
    });
    
    return NextResponse.json(
      { success: true, message: 'Verification email resent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
