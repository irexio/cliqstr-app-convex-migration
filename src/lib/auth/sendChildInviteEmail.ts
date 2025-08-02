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

import { sendEmail } from '@/lib/email';

interface ChildInviteEmailParams {
  to: string;               // Trusted adult's email
  cliqName: string;         // Name of the cliq
  inviterName: string;      // Name of the person sending the invite
  inviteLink: string;       // Link to accept the invite
  friendFirstName: string;  // Child's first name
  inviteNote?: string;      // Optional message to the parent
  inviteCode: string;       // Invite code for manual entry
}

export async function sendChildInviteEmail({
  to,
  cliqName,
  inviterName,
  inviteLink,
  friendFirstName,
  inviteNote,
  inviteCode
}: ChildInviteEmailParams) {
  console.log(`[CHILD_INVITE_EMAIL] Sending invite for ${friendFirstName} to ${to}`);
  
  // Construct the email subject
  const subject = `${inviterName} invited ${friendFirstName} to join ${cliqName} on Cliqstr`;
  
  // Construct the email body with child-specific content
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2>${friendFirstName} has been invited to join <strong>${cliqName}</strong> on Cliqstr!</h2>
      <p><strong>${inviterName}</strong> has invited ${friendFirstName} to join their private group.</p>
      
      <p>
        Cliqstr is a safe, private space for families, kids, and trusted groups.
        No ads. No tracking. Just your people.
      </p>
      
      ${inviteNote ? `
      <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #000000;">
        <p style="margin: 0;"><strong>Message from ${inviterName}:</strong></p>
        <p style="margin: 8px 0 0;">${inviteNote}</p>
      </div>
      ` : ''}
      
      <p><strong>As ${friendFirstName}'s parent/guardian</strong>, you'll need to create and manage their account.</p>
      
      <div style="margin: 30px 0;">
        <a href="${inviteLink}" style="display:inline-block; padding:12px 24px; background:#000000; color:white; border-radius:5px; text-decoration:none; font-weight: bold; font-size: 16px;">
          Accept Invite for ${friendFirstName}
        </a>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px;">
        <p style="margin: 0 0 8px; font-weight: bold; color: #333;">Your Cliq Code: <span style="font-family: monospace; background: #fff; padding: 2px 6px; border-radius: 3px;">cliq-${inviteCode}</span></p>
        <p style="margin: 0; font-size: 14px; color: #666;">Joining from another device? Visit <a href="https://cliqstr.com/invite/manual" style="color: #000;">cliqstr.com/invite/manual</a> and enter this code.</p>
      </div>
      
      <p>
        <strong>Child Safety:</strong> Cliqstr requires adult verification for all child accounts.
        Children cannot create their own accounts without parental approval.
      </p>
      
      <p style="font-size: 12px; color: #888;">This invite link is valid for 36 hours.</p>
    </div>
  `;
  
  try {
    // Send the email using our standardized email utility
    const result = await sendEmail({
      to,
      subject,
      html
    });
    
    if (result.success) {
      console.log(`[CHILD_INVITE_EMAIL] Successfully sent invite for ${friendFirstName} to ${to}`);
      return {
        success: true,
        messageId: result.messageId
      };
    } else {
      console.error(`[CHILD_INVITE_EMAIL] Failed to send invite for ${friendFirstName} to ${to}:`, result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error(`[CHILD_INVITE_EMAIL] Exception sending invite for ${friendFirstName} to ${to}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
