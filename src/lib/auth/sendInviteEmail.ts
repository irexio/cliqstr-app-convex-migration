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
  console.log(`📨 [sendInviteEmail] Sending invite to: ${to} for cliq: ${cliqName}`);
  
  const subject = `${inviterName} invited you to join ${cliqName} on Cliqstr!`;

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>You're invited to join <strong>${cliqName}</strong> on Cliqstr!</h2>
      <p>${inviterName} thinks you'd love it.</p>
      <p>
        Cliqstr is a safe, private space for families, kids, and trusted groups.
        No ads. No tracking. Just your people.
      </p>
      <p>
        <a href="${inviteLink}" style="display:inline-block; padding:10px 20px; background:#7F56D9; color:white; border-radius:5px; text-decoration:none;">
          Accept Invite
        </a>
      </p>
      <p style="font-size: 12px; color: #888;">This invite link is valid for 36 hours.</p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject,
    html
  });
  
  if (!result.success) {
    console.error(`❌ [sendInviteEmail] Failed to send invite email to ${to}:`, result.error);
  }
  
  return result;
}
