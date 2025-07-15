/**
 * 🔐 APA-SAFE UTILITY: sendResetEmail
 *
 * Purpose:
 *   - Sends a secure password reset email to the provided user
 *   - Includes a unique secure reset code as part of a reset link
 *   - Uses Resend API for delivery (resend.com)
 *
 * Notes:
 *   - Secure code is embedded in a clickable URL
 *   - Email content is friendly, APA-safe, and non-invasive
 *   - Logs success or failure for internal monitoring
 *
 * Environment Requirements:
 *   - RESEND_API_KEY must be set (Vercel or local .env)
 *   - NEXT_PUBLIC_BASE_URL must reflect live/resettable frontend
 *
 * Used By:
 *   - /api/auth/reset-password/request (or equivalent route)
 *
 * Status: Production-ready for password recovery workflows
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendResetEmail(email: string, resetCode: string) {
  // Using NEXT_PUBLIC_SITE_URL which is the standard URL env var throughout the app
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?code=${resetCode}`;

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

    console.log('[✅] Password reset email sent successfully');
    return { success: true, data };
  } catch (err: any) {
    console.error('❌ Failed to send reset email:', err);
    const errorMessage = err.message || 'Unknown email service error';
    console.error('Detailed error:', { message: errorMessage, code: err.code, statusCode: err.statusCode });
    return { 
      success: false, 
      error: errorMessage,
      details: {
        code: err.code,
        statusCode: err.statusCode,
        service: 'Resend',
        apiKeyExists: !!process.env.RESEND_API_KEY,
        apiKeyLength: process.env.RESEND_API_KEY?.length || 0
      }
    };
  }
}
