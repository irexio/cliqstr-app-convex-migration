'use server';

import { sendEmail, BASE_URL } from '@/lib/email';

type SendParentApprovalEmailParams = {
  to: string;
  childName: string;
  childAge: number;
  approvalCode: string;
  subject?: string;
  html?: string;
};

export async function sendParentApprovalEmail({
  to,
  childName,
  childAge,
  approvalCode,
  subject,
  html,
}: SendParentApprovalEmailParams) {
  console.log(`📨 [sendParentApprovalEmail] Sending parent approval email to: ${to} for child: ${childName}`);
  
  const defaultSubject = `${childName} wants to join Cliqstr - Parent Approval Required`;

  const approvalLink = `${BASE_URL}/parent-approval?code=${approvalCode}`;

  const defaultHtml = `
    <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2>Your child wants to join Cliqstr</h2>
      <p>Hello!</p>
      <p>Your child <strong>${childName}</strong> (age ${childAge}) would like to create an account on Cliqstr, a safe and private space for families and close friends to connect.</p>
      
      <div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #007bff;">What is Cliqstr?</h3>
        <p style="margin-bottom: 0;">Cliqstr is designed specifically for families and trusted groups. It's not a public social network - it's a private space where your child can safely connect with family members and close friends you approve.</p>
      </div>

      <p><strong>To approve ${childName}'s account, please click the link below:</strong></p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${approvalLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Approve ${childName}'s Account
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666;">
        <strong>This approval link will expire in 7 days.</strong><br>
        If you did not expect this request, you can safely ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #888;">
        Questions about Cliqstr? Visit our website or contact support.<br>
        This email was sent because ${childName} entered your email address during sign-up.
      </p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject: subject || defaultSubject,
    html: html || defaultHtml,
  });
  
  if (!result.success) {
    console.error(`❌ [sendParentApprovalEmail] Failed to send parent approval email to ${to}:`, result.error);
  }
  
  return result;
}
