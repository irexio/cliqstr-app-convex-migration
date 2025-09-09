import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

/**
 * Returns an array of parent email addresses linked to a given child profile.
 * CRITICAL for child safety - used for parent notifications and alerts.
 */
export async function getParentEmailsForChild(childId: string): Promise<string[]> {
  return await convexHttp.query(api.users.getParentEmailsForChild, {
    childId: childId as any,
  });
}
