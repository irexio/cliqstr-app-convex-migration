import { getParentEmailsForChild } from './getParentEmailsForChild';
import { sendParentEmail } from '@/lib/sendParentEmail';

/**
 * Sends a notification to all parent emails linked to a given child.
 */
export async function notifyParents({
  childId,
  childName,
  subject,
  messageHtml,
}: {
  childId: string;
  childName: string;
  subject: string;
  messageHtml: string;
}) {
  const emails = await getParentEmailsForChild(childId);

  for (const email of emails) {
    await sendParentEmail({
      to: email,
      childName,
      subject,
      html: messageHtml,
      childId, // Optional: include if sendParentEmail uses it
    });
  }
}
