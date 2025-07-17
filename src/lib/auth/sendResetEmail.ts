/**
 * 🔐 APA-SAFE UTILITY: sendResetEmail
 *
 * Purpose:
 *   - Handles the complete password reset flow:
 *     1. Validates the email exists in the database
 *     2. Generates a secure reset token
 *     3. Updates the user record with the token
 *     4. Sends a reset email via Resend API
 *   - Returns standardized response for API routes
 */

import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

type SendResetEmailResponse = {
  success: boolean;
  error?: string;
  details?: any;
  data?: any;
  token?: string;
  tokenExpires?: Date;
};

/**
 * Comprehensive password reset email handler
 * 
 * @param email User's email address
 * @param generateNewToken Whether to generate a new token (default: true)
 * @param existingToken Optional token to use instead of generating a new one
 * @returns Response object with success status and any error details
 */
export async function sendResetEmail(
  email: string,
  generateNewToken: boolean = true,
  existingToken?: string
): Promise<SendResetEmailResponse> {
  // 1. Validate environment variables
  const apiKey = process.env.RESEND_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cliqstr.com';

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is missing. Cannot send password reset email.');
    return {
      success: false,
      error: 'Email service configuration error',
    };
  }

  try {
    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. Don't reveal if the user exists or not for security
    if (!user) {
      console.log(`[🔒] Reset request for non-existent email: ${email}`);
      return { success: true }; // Security: Return success even if user doesn't exist
    }

    // 4. Token handling
    let token: string;
    let tokenExpires: Date;
    
    if (generateNewToken) {
      // Generate a secure random reset token
      token = crypto.randomBytes(32).toString('hex');
      tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Save the token to the user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: tokenExpires,
        },
      });
    } else if (existingToken) {
      token = existingToken;
      tokenExpires = user.resetTokenExpires || new Date(Date.now() + 60 * 60 * 1000);
    } else {
      return {
        success: false,
        error: 'No token provided or generated',
      };
    }

    // 5. Send email via Resend
    const resend = new Resend(apiKey);
    const resetUrl = `${baseUrl}/reset-password?code=${token}`;

    const data = await resend.emails.send({
      from: 'Cliqstr <noreply@email.cliqstr.com>',
      to: email,
      subject: 'Reset Your Cliqstr Password',
      html: `
        <p>Hi there,</p>
        <p>Someone (hopefully you!) requested a password reset for your Cliqstr account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" target="_blank">Reset Password</a></p>
        <p>Or copy this URL into your browser: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>Stay safe,<br/>The Cliqstr Team</p>
      `,
    });

    console.log('[✅] Password reset email sent successfully to:', email);
    return { 
      success: true, 
      data,
      token,
      tokenExpires
    };
  } catch (err: any) {
    console.error('❌ Failed to send reset email:', err);
    return {
      success: false,
      error: err.message || 'Unknown error',
      details: {
        code: err.code,
        status: err.statusCode,
        context: 'Reset email process failure',
      },
    };
  }
}
