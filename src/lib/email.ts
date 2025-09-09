import { Resend } from 'resend';

// Centralized Resend instance
export const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

// Fallback for build-time initialization - only create if key exists
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Standard from address
export const FROM_EMAIL = 'Cliqstr <noreply@email.cliqstr.com>';

// Base URL for links
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cliqstr.com';

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: any;
};

/**
 * Standardized email sending function with error handling
 * Uses Resend API to deliver emails
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = FROM_EMAIL
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    console.log(`📧 [EMAIL] Sending email to: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`📧 [EMAIL] Subject: ${subject}`);
    
    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [EMAIL ERROR] Missing RESEND_API_KEY environment variable');
      return {
        success: false,
        error: 'Missing RESEND_API_KEY environment variable'
      };
    }
    
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ [EMAIL ERROR]', error);
      return {
        success: false,
        error
      };
    }

    console.log(`✅ [EMAIL] Successfully sent email with ID: ${data?.id}`);
    return {
      success: true,
      messageId: data?.id
    };
  } catch (error) {
    console.error('❌ [EMAIL EXCEPTION]', error);
    return {
      success: false,
      error
    };
  }
}
