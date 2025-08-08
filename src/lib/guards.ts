import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

/**
 * Redirect a pending child to /awaiting-approval.
 * Adults and parents pass through. Logged-out users should be gated earlier.
 */
export async function guardPendingChildToAwaitingApproval() {
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) return; // calling page can decide to redirect to sign-in

  // Identify if this user has ChildSettings (i.e., is a child) and is pending
  const profile = await prisma.myProfile.findUnique({
    where: { userId },
    select: { id: true, childSettings: { select: { inviteRequiresApproval: true } } },
  });

  const isChild = !!profile?.childSettings;
  const pending = !!profile?.childSettings?.inviteRequiresApproval;

  if (isChild && pending) {
    redirect('/awaiting-approval');
  }
}
