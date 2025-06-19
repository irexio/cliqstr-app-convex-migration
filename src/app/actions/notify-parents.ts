'use server';

import { sendParentEmail } from '@/lib/sendParentEmail';

export async function notifyParent({
  parentEmail,
  childName,
  childId,
  inviteCode,
}: {
  parentEmail: string;
  childName: string;
  childId: string;
  inviteCode?: string;
}) {
  try {
    await sendParentEmail({
      to: parentEmail,
      childName,
      childId,
      inviteCode,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending parent notification:', error);
    return { success: false };
  }
}
