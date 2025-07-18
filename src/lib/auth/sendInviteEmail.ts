// 🔐 APA-SAFE — Centralized Invite Email Sender

import { sendEmail, BASE_URL } from '@/lib/email';

export async function sendInviteEmail({
  to,
  cliqName,
  inviterName,
  inviteLink,
}: {
  to: string;
  cliqName: string;
  inviterName: string;
  inviteLink: string;
}) {
  // Extra detailed logging for debugging
  console.log(`📨 [sendInviteEmail] STARTING - Sending invite to: ${to}`);
  console.log(`[EMAIL DEBUG] Invite details: cliq=${cliqName}, inviter=${inviterName}`);
  console.log(`[EMAIL DEBUG] Using invite link: ${inviteLink}`);
  
  // Validate required parameters
  if (!to || !cliqName || !inviterName || !inviteLink) {
    console.error(`❌ [sendInviteEmail] Missing required parameters:`, { to, cliqName, inviterName, inviteLink });
    return { success: false, error: 'Missing required parameters for invite email' };
  }
  
  // Improved subject line with inviter's real name
  const subject = `${inviterName} invited you to join ${cliqName} on Cliqstr!`;

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2>You're invited to join <strong>${cliqName}</strong> on Cliqstr!</h2>
      <p><strong>${inviterName}</strong> thinks you'd love it.</p>
      <p>
        Cliqstr is a safe, private space for families, kids, and trusted groups.
        No ads. No tracking. Just your people.
      </p>
      <div style="margin: 30px 0;">
        <a href="${inviteLink}" style="display:inline-block; padding:12px 24px; background:#7F56D9; color:white; border-radius:5px; text-decoration:none; font-weight: bold; font-size: 16px;">
          Accept Invite
        </a>
      </div>
      <p style="font-size: 12px; color: #888;">This invite link is valid for 36 hours.</p>
    </div>
  `;

  console.log(`[EMAIL DEBUG] Attempting to send email to ${to} with subject "${subject}"`);
  
  try {
    const result = await sendEmail({
      to,
      subject,
      html
    });
    
    if (!result.success) {
      console.error(`❌ [sendInviteEmail] Failed to send invite email to ${to}:`, result.error);
      return result;
    }
    
    console.log(`✅ [sendInviteEmail] Successfully sent invite email to ${to} with messageId: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`❌ [sendInviteEmail] Exception while sending invite email to ${to}:`, error);
    return { success: false, error };
  }
}
