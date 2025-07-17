// 🔐 APA-HARDENED EMAIL UTILITY — Sends Reset Password Link via Resend

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // Don't reveal if the user exists or not for security
    if (!user) {
      console.log(`Reset request for non-existent email: ${email}`);
      return NextResponse.json({ success: true });
    }
    
    // Generate a secure random reset token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save the token to the user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: tokenExpires,
      },
    });
    const resetUrl = `https://cliqstr.com/reset-password?code=${token}`;

    const data = await resend.emails.send({
      from: 'Cliqstr <onboarding@resend.dev>', // ✅ Use verified sender for now
      to: email,
      subject: 'Reset your Cliqstr password',
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password for your Cliqstr account.</p>
        <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">Click here to reset your password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `
    });

    console.log('📤 Resend response:', data);

    if (data.error) {
      console.error('💣 Resend failed:', data.error);
      return NextResponse.json({ success: false, details: data.error }, { status: 500 });
    }
    
    console.log(`✅ Reset email sent to ${email} with token expiry: ${tokenExpires}`);

    // Always return success even if the email doesn't exist (security best practice)
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('💥 Resend exception thrown:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
