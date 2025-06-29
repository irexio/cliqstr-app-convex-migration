// 🔐 APA-SAFE — Centralized Invite Email Sender

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const subject = `${inviterName} invited you to join ${cliqName} on Cliqstr!`;

  const body = `
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

  await resend.emails.send({
    from: 'Cliqstr <noreply@cliqstr.com>',
    to,
    subject,
    html: body,
  });
}
