/**
 * 🔐 APA-SAFE UTILITY: sendResetEmail
 *
 * Purpose:
 *   - Sends a secure password reset email to the provided user
 *   - Uses Resend API (resend.com) for email delivery
 */

import { Resend } from 'resend';

export async function sendResetEmail(email: string, resetCode: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is missing. Cannot send password reset email.');
    return {
      success: false,
      error: 'Missing RESEND_API_KEY in environment variables',
    };
  }

  if (!baseUrl) {
    console.error('❌ NEXT_PUBLIC_SITE_URL is missing. Cannot construct reset URL.');
    return {
      success: false,
      error: 'Missing NEXT_PUBLIC_SITE_URL in environment variables',
    };
  }

  const resend = new Resend(apiKey);
  const resetUrl = `${baseUrl}/reset-password?code=${resetCode}`;

  try {
    const data = await resend.emails.send({
      from: 'Cliqstr <support@cliqstr.com>',
      to: email,
      subject: 'Reset Your Cliqstr Password',
      html: `
        <p>Hi there,</p>
        <p>Someone (hopefully you!) requested a password reset for your Cliqstr account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>Stay safe,<br/>The Cliqstr Team</p>
      `,
    });

    console.log('[✅] Password reset email sent successfully to:', email);
    return { success: true, data };
  } catch (err: any) {
    console.error('❌ Failed to send reset email:', err);
    return {
      success: false,
      error: err.message || 'Unknown error',
      details: {
        code: err.code,
        status: err.statusCode,
        context: 'Resend API failure',
      },
    };
  }
}
