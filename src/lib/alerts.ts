// Notification logic for parent alerts
import { prisma } from './prisma';
import { sendEmail } from './email';

export async function sendParentAlert({ parentId, cliqId, triggeredById, reason }: { parentId: string, cliqId: string, triggeredById: string, reason?: string }) {
  // Fetch parent email
  const parent = await prisma.user.findUnique({ where: { id: parentId }, include: { account: true } });
  if (!parent || !parent.email) return;
  // Compose alert email
  const subject = 'Red Alert: Immediate Attention Required';
  const body = `A Red Alert was triggered in your cliq.\n\nCliq ID: ${cliqId}\nTriggered by: ${triggeredById}\nReason: ${reason || 'No reason provided.'}`;
  // Send email
  await sendEmail({ to: parent.email, subject, body });
}
