// NOTE: This email verification flow is APA-compliant but not currently used.
// All user verification is handled via credit card + parent approval.
/**
 * Email Verification Helper
 * 
 * Purpose:
 * - Sends a non-blocking verification email to adult users
 * - Used as a secondary verification method alongside payment verification
 * - Helps ensure account recovery in case of forgotten passwords
 */

import { sendEmail, BASE_URL } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface SendVerificationEmailOptions {
  to: string;
  userId: string;
  name?: string;
}

export async function sendVerificationEmail({ to, userId, name }: SendVerificationEmailOptions) {
  try {
    // Generate a secure, random verification code (24 hour expiration)
    const code = [...Array(48)].map(() => Math.random().toString(36)[2]).join('');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const displayName = name || to.split('@')[0];

    // Hash the code before storing
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    // Store hash and expiry in User model
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: codeHash,
        verificationExpires: expiresAt,
      },
    });

    const verificationLink = `${BASE_URL}/verify-email?code=${code}`;

    console.log(`📨 [sendVerificationEmail] Sending verification email to: ${to}`);
    
    const result = await sendEmail({
      to,
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
      `
    });

    if (!result.success) {
      console.error(`❌ [sendVerificationEmail] Failed to send verification email to ${to}:`, result.error);
      return { 
        success: false, 
        message: 'Failed to send verification email',
        error: result.error
      };
    }
    
    return { 
      success: true, 
      messageId: result.messageId || 'unknown',
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
