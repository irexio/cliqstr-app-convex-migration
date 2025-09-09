// Notification logic for parent alerts
import { convexHttp } from './convex-server';
import { api } from 'convex/_generated/api';
import { sendEmail } from './email';

export async function sendParentAlert({ parentId, cliqId, triggeredById, reason }: { parentId: string, cliqId: string, triggeredById: string, reason?: string }) {
  console.log(`📨 [sendParentAlert] Sending red alert to parent: ${parentId} for cliq: ${cliqId}`);
  
  // Fetch parent email using Convex
  const parent = await convexHttp.query(api.users.getCurrentUser, { userId: parentId as any });
  if (!parent || !parent.email) {
    console.error(`❌ [sendParentAlert] No parent email found for ID: ${parentId}`);
    return;
  }
  
  // Compose alert email
  const subject = 'Red Alert: Immediate Attention Required';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff0000;">Red Alert: Action Required</h2>
      <p>A Red Alert was triggered in your cliq.</p>
      <p><strong>Cliq ID:</strong> ${cliqId}</p>
      <p><strong>Triggered by:</strong> ${triggeredById}</p>
      <p><strong>Reason:</strong> ${reason || 'No reason provided.'}</p>
      <p>Please log in to your Cliqstr account immediately to review this alert.</p>
    </div>
  `;
  
  // Send email
  const result = await sendEmail({ to: parent.email, subject, html });
  
  if (!result.success) {
    console.error(`❌ [sendParentAlert] Failed to send alert email to ${parent.email}:`, result.error);
  }
  
  return result;
}
