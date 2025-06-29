// 🔐 sendInviteEmail.ts — Central invite email sender for cliq invites

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInviteEmailOptions {
  to: string;
  cliqName: string;
  inviterName: string;
  cliqId: string;
}

export async function sendInviteEmail({
  to,
  cliqName,
  inviterName,
  cliqId,
}: SendInviteEmailOptions) {
  const inviteLink = `https://cliqstr.com/invite-request/${cliqId}?email=${encodeURIComponent(to)}`;

  try {
    const response = await resend.emails.send({
      from: 'Cliqstr <noreply@cliqstr.com>',
      to: [to],
      subject: `${inviterName} invited you to join their ${cliqName} cliq on Cliqstr`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h2>${inviterName} invited you to join their cliq: <strong>${cliqName}</strong></h2>
          <p>Cliqstr is a safe, ad-free platform where families and friends connect in trusted circles.</p>
          <p>To join this cliq, please verify your age to protect our users — especially children.</p>
          <ul>
            <li>✅ Free to join</li>
            <li>✅ Credit card required for age verification only</li>
            <li>✅ No public profiles, no ads, ever</li>
          </ul>
          <p>
            <a href="${inviteLink}" style="background-color: #7e22ce; color: white; padding: 12px 18px; text-decoration: none; border-radius: 4px;">Accept Invite</a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><code>${inviteLink}</code></p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error('❌ Failed to send invite email:', error);
    throw new Error('Failed to send invite email');
  }
}
