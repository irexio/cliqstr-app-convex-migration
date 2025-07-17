/**
 * 🔐 APA-SAFE UTILITY: sendResetEmail
 *
 * Sends a secure password reset email using Resend.
 * Now includes full diagnostic logging to help troubleshoot delivery issues.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendResetEmail(email: string, resetCode: string) {
  console.log('[📨] sendResetEmail was called with:', email, resetCode);

  // Use configured site URL for building reset link
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?code=${resetCode}`;
  console.log('[🔗] Generated reset URL:', resetUrl);

  // Check environment config
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing from environment');
    throw new Error('Missing RESEND_API_KEY');
  }

  try {
    console.log('[📨] Attempting to send email using Resend...');
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
    const errorMessage = err.message || 'Unknown email service error';

    console.error('📋 Diagnostic Details:', {
      message: errorMessage,
      code: err.code,
      statusCode: err.statusCode,
      service: 'Resend',
      apiKeyExists: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0
    });

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
