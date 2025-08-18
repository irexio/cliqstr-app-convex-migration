/**
 * 🔐 APA-HARDENED — Child Invite Email Sender
 * 
 * This utility sends invite emails to parents/guardians of children
 * who have been invited to join a cliq.
 * 
 * The email is sent to the trusted adult contact and includes:
 * - Who invited the child (inviter name)
 * - The child's first name
 * - The cliq they're being invited to
 * - A personalized note (optional)
 * - A link to accept the invite
 * 
 * Security notes:
 * - All child accounts must be created by a parent/guardian
 * - The invite link leads to a page that requires adult verification
 * - Detailed logging for audit trail
 */

import { sendEmail, BASE_URL } from '@/lib/email';

interface ChildInviteEmailParams {
  to: string;               // Trusted adult's email
  cliqName: string;         // Name of the cliq
  inviterName: string;      // Name of the person sending the invite
  inviteLink: string;       // Link to accept the invite
  friendFirstName: string;  // Child's first name
  friendLastName?: string;  // Child's last name
  inviteNote?: string;      // Optional message to the parent
  inviteCode: string;       // Invite code for manual entry
  parentAccountExists?: boolean; // Whether parent already has account
}

export async function sendChildInviteEmail({
  to,
  cliqName,
  inviterName,
  inviteLink,
  friendFirstName,
  friendLastName = '',
  inviteNote,
  inviteCode,
  parentAccountExists = false
}: ChildInviteEmailParams) {
  const childFullName = friendLastName ? `${friendFirstName} ${friendLastName}` : friendFirstName;
  console.log(`[CHILD_INVITE_EMAIL] Sending invite for ${childFullName} to ${to}`);
  
  const declineLink = `${BASE_URL}/api/invite/decline?code=${inviteCode}`;
  const subject = `${inviterName} invited your child ${childFullName} to Cliqstr — Your approval is required`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background: white; padding: 40px 20px;">
      
      <h1 style="color: #333; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Hi there,</h1>
      
      <p style="color: #555; margin-bottom: 20px;">
        <strong>${inviterName}</strong> has invited your child, <strong>${childFullName}</strong>, to join their private Cliq on Cliqstr.
      </p>
      
      <p style="color: #555; margin-bottom: 16px;">
        We know our parent approval process is more involved than most social platforms — and that's intentional. Every step is designed to keep your child and all Cliqstr members safe.
      </p>
      
      <p style="color: #555; margin-bottom: 16px;">
        Private Cliqs are small, invitation-only groups — like digital circles of trust — where members can connect safely, without ads, strangers, or pressure.
      </p>
      
      <div style="background: #f8f9fa; border-left: 4px solid #000; padding: 20px; margin: 24px 0;">
        <p style="margin: 0; color: #333; font-weight: 600; font-size: 16px;">🔐 Before ${childFullName} can join, your approval is required.</p>
      </div>
      
      <p style="color: #555; margin-bottom: 8px;">To activate their account, we ask that you:</p>
      <ul style="color: #555; margin-bottom: 20px; padding-left: 20px;">
        ${parentAccountExists 
          ? `<li style="margin-bottom: 8px;">Sign in to your existing Cliqstr account</li>
             <li style="margin-bottom: 8px;">Review ${childFullName}'s invitation and group access</li>`
          : `<li style="margin-bottom: 8px;">Create a Parent account</li>
             <li style="margin-bottom: 8px;">Confirm your identity with a credit card (you will not be charged)</li>
             <li style="margin-bottom: 8px;">Review ${childFullName}'s invitation and group access</li>`
        }
      </ul>
      
      <p style="color: #555; margin-bottom: 24px;">
        This lets us confirm that an adult is aware and in control of how their child uses Cliqstr.
      </p>
      
      <div style="background: #f0f8ff; border-left: 4px solid #4a90e2; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 12px; color: #333; font-weight: 600;">🎁 Good to know:</p>
        <ul style="margin: 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;">${childFullName} can join this Cliq for free</li>
          <li style="margin-bottom: 8px;">They will only be able to interact within ${inviterName}'s group</li>
          <li style="margin-bottom: 0;">You can upgrade later to unlock more features or create new Cliqs — but no payment is required to approve their invite</li>
        </ul>
      </div>
      
      <div style="background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 12px; color: #333; font-weight: 600;">🛡️ Why Parents Trust Cliqstr</p>
        <ul style="margin: 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;">All child activity is monitored and logged</li>
          <li style="margin-bottom: 8px;">No ads, no direct messaging between children</li>
          <li style="margin-bottom: 8px;">Parents can view every post, invite, and cliq</li>
          <li style="margin-bottom: 0;">Every group is curated and actively moderated</li>
        </ul>
      </div>
      
      <p style="color: #333; font-size: 18px; font-weight: 600; margin: 32px 0 20px;">✅ What would you like to do?</p>
      
      <div style="margin: 24px 0;">
        <a href="${inviteLink}" style="display: inline-block; background: #000; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Approve ${friendFirstName}'s Invite & Set Up Your Account
        </a>
        <p style="color: #666; font-size: 14px; margin: 8px 0 0; font-style: italic;">
          (Takes you to Cliqstr's secure Parent HQ to finish setup)
        </p>
      </div>
      
      <div style="margin: 20px 0;">
        <a href="${declineLink}" style="color: #666; text-decoration: underline; font-size: 14px;">
          Decline Invitation
        </a>
        <p style="color: #666; font-size: 12px; margin: 4px 0 0; font-style: italic;">
          (Let us know you're not approving ${friendFirstName}'s invite — no further action needed)
        </p>
      </div>
      
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee;">
        <p style="color: #333; font-weight: 600; margin-bottom: 8px;">❤️ From all of us at Cliqstr</p>
        <p style="color: #666; font-style: italic; margin: 0;">Safe spaces. Real connections. Peace of mind.</p>
      </div>
    </div>
  `;

  try {
    const result = await sendEmail({ to, subject, html });

    if (result.success) {
      console.log(`[CHILD_INVITE_EMAIL] Successfully sent invite for ${friendFirstName} to ${to}`);
      return { success: true, messageId: result.messageId };
    } else {
      console.error(`[CHILD_INVITE_EMAIL] Failed to send invite:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`[CHILD_INVITE_EMAIL] Exception:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
