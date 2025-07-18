'use server';

import { sendEmail, BASE_URL } from '@/lib/email';

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
  console.log(`📨 [sendParentEmail] Sending parent approval email to: ${to} for child: ${childName}`);
  
  const defaultSubject = 'Approve Your Child\'s Cliqstr Account';

  const approvalLink = inviteCode
    ? `${BASE_URL}/parent-approval?inviteCode=${inviteCode}&childId=${childId}`
    : `${BASE_URL}/parent-approval?childId=${childId}`;

  const defaultHtml = `
    <p>Hello!</p>
    <p>Your child <strong>${childName}</strong> is signing up for Cliqstr, a safe and private space to connect with close family and friends.</p>
    <p>To approve their account, please click the link below:</p>
    <p><a href="${approvalLink}">${approvalLink}</a></p>
    <p><strong>This link will expire in 3 days.</strong></p>
    <p>If you did not request this, you can safely ignore it.</p>
  `;

  const result = await sendEmail({
    to,
    subject: subject || defaultSubject,
    html: html || defaultHtml,
  });
  
  if (!result.success) {
    console.error(`❌ [sendParentEmail] Failed to send parent approval email to ${to}:`, result.error);
  }
  
  return result;
}
