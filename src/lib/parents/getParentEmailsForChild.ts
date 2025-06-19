import { prisma } from '@/lib/prisma';

/**
 * Returns an array of parent email addresses linked to a given child profile.
 */
export async function getParentEmailsForChild(childId: string): Promise<string[]> {
  const links = await prisma.parentLink.findMany({
    where: { childId },
    select: { email: true },
  });

  return links.map(link => link.email);
}
