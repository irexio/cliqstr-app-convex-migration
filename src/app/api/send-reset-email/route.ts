// 🔐 APA-HARDENED EMAIL UTILITY — Sends Reset Password Link via Resend

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();
    
    if (!email || !token) {
      return NextResponse.json({ error: 'Missing email or token' }, { status: 400 });
    }
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('💥 Resend exception thrown:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
