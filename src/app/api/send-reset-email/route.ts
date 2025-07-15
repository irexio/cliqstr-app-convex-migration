// 🔐 APA-HARDENED by Aiden — Password Reset Email Endpoint
// This API route handles sending secure reset links to verified users.
// No role assumptions or session creation occurs. Sends secure token via Resend.
// Fully server-side and safe for untrusted clients.

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResetEmail } from '@/lib/auth/sendResetEmail';
import crypto from 'crypto';

export async function POST(req: Request) {
  console.log('🔍 Password reset request received');
  
  try {
    const { email } = await req.json();
    console.log('📧 Email received:', email ? 'provided' : 'missing');

    if (!email) {
      console.log('❌ No email provided');
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // Check if RESEND_API_KEY exists
    console.log('🔑 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('🔑 API Key length:', process.env.RESEND_API_KEY?.length || 0);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    console.log('👤 User found:', !!user);

    if (!user || !user.profile) {
      console.log('❌ No user/profile found for email');
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    console.log('🎫 Generating secure reset code...');
    // Generate a secure random reset code
    const resetCode = crypto.randomBytes(32).toString('hex');
    const resetCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes (increased from 15 minutes)

    // Store secure code in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetCode, // Using existing database field
        resetTokenExpires: resetCodeExpires,
      },
    });

    const resetLink = `https://cliqstr.com/reset-password?code=${resetCode}`;
    console.log('🔗 Reset link generated');

    console.log('📬 Attempting to send email via sendResetEmail utility...');
    // Use the dedicated utility that has its own Resend instance
    const emailResult = await sendResetEmail(email, resetCode);

    console.log('✅ Send email response:', emailResult);
    
    if (!emailResult.success) {
      console.error('💥 Email sending failed with details:', emailResult.details);
      return NextResponse.json({ 
        error: "Failed to send reset email. Please try again later.",
        details: emailResult.details 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('💥 Send reset email error:', err);
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to process password reset request. Please try again later.',
      message: err instanceof Error ? err.message : 'Unknown server error'
    }, { status: 500 });
  }
}
