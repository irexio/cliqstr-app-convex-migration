// 🔐 APA-HARDENED by Aiden — Password Reset Email Endpoint
// This API route handles sending secure reset links to verified users.
// No role assumptions or session creation occurs. Sends secure token via Resend.
// Fully server-side and safe for untrusted clients.

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
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

    console.log('🎫 Generating reset token...');
    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    const resetLink = `https://cliqstr.com/reset-password?token=${resetToken}`;
    console.log('🔗 Reset link generated');

    console.log('📬 Attempting to send email via Resend...');
    const emailResult = await resend.emails.send({
      to: email,
      from: 'noreply@email.cliqstr.com',
      subject: 'Reset Your Cliqstr Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
    });

    console.log('✅ Resend response:', emailResult);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('💥 Send reset email error:', err);
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
