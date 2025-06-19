'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type SendParentEmailParams = {
  to: string;
  childName: string;
  childId: string;
  inviteCode?: string;
  subject?: string;
  html?: string;
};

export async function sendParentEmail({
  to,
  childName,
  childId,
  inviteCode,
  subject,
  html,
}: SendParentEmailParams) {
  const defaultSubject = 'Approve Your Child’s Cliqstr Account';

  const approvalLink = inviteCode
    ? `https://cliqstr.com/parent-approval?inviteCode=${inviteCode}&childId=${childId}`
    : `https://cliqstr.com/parent-approval?childId=${childId}`;

  const defaultHtml = `
    <p>Hello!</p>
    <p>Your child <strong>${childName}</strong> is signing up for Cliqstr, a safe and private space to connect with close family and friends.</p>
    <p>To approve their account, please click the link below:</p>
    <p><a href="${approvalLink}">${approvalLink}</a></p>
    <p><strong>This link will expire in 3 days.</strong></p>
    <p>If you did not request this, you can safely ignore it.</p>
  `;

  return resend.emails.send({
    from: 'Cliqstr <no-reply@cliqstr.com>',
    to,
    subject: subject || defaultSubject,
    html: html || defaultHtml,
  });
}
