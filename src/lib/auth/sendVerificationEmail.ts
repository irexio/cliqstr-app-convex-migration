/**
 * Email Verification Helper
 * 
 * Purpose:
 * - Sends a non-blocking verification email to adult users
 * - Used as a secondary verification method alongside payment verification
 * - Helps ensure account recovery in case of forgotten passwords
 */

import { Resend } from 'resend';
import { signToken, TokenPayload } from './jwt';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface SendVerificationEmailOptions {
  to: string;
  userId: string;
  name?: string;
}

export async function sendVerificationEmail({ to, userId, name }: SendVerificationEmailOptions) {
  try {
    // Generate verification token (24 hour expiration)
    const tokenPayload: TokenPayload = { 
      userId, 
      purpose: 'email_verification',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    const token = signToken(tokenPayload);

    const verificationLink = `${APP_URL}/verify-email?token=${token}`;
    const displayName = name || to.split('@')[0];

    const response = await resend.emails.send({
      from: 'Cliqstr <noreply@cliqstr.com>',
      to: [to],
      subject: 'Verify your Cliqstr account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000;">Welcome to Cliqstr!</h2>
          <p>Hi ${displayName},</p>
          <p>Thanks for signing up! Please verify your email address to complete your account setup.</p>
          <p>This step is <strong>optional</strong>, but it helps us keep your account secure and enables password recovery.</p>
          
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #000; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify My Email
            </a>
          </div>
          
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account on Cliqstr, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Cliqstr - The private social platform for friends, family and safe online communities</p>
        </div>
      `,
    });

    return { 
      success: true, 
      messageId: response.data?.id || 'unknown',
      message: 'Verification email sent successfully'
    };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { 
      success: false, 
      message: 'Failed to send verification email',
      error
    };
  }
}
