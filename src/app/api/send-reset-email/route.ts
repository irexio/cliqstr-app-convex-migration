// 🔐 APA-HARDENED EMAIL UTILITY — Sends Reset Password Link via Resend

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendResetEmail(email: string, token: string) {
  try {
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
      console.error('📛 Resend failed:', data.error);
      return { success: false, details: data.error };
    }

    return { success: true };
  } catch (err) {
    console.error('💥 Resend exception thrown:', err);
    return { success: false, details: err };
  }
}
