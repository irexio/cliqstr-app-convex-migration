import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { invalidateUser } from '@/lib/cache/userCache';

/**
 * Updates session.lastActivityAt and invalidates the acting user's cache.
 * Safe to call from API routes; swallows errors and returns whether it updated.
 */
export async function bumpActivityAndInvalidate(): Promise<boolean> {
  try {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (session?.userId) {
      session.lastActivityAt = Date.now();
      await session.save();
      await invalidateUser(String(session.userId));
      return true;
    }
  } catch (error) {
    console.error('[session-activity] Failed to bump activity', error);
  }
  return false;
}


