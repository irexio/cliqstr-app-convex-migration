// Server-only current user with iron-session, cache-first
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { convexHttp } from '@/lib/convex-server';
import { api } from '../../../convex/_generated/api';
import { getCachedUser, setCachedUser } from '@/lib/cache/userCache';

const IDLE_MS = (Number(process.env.SESSION_IDLE_MINUTES ?? 15)) * 60_000;

export class UnauthorizedExpired extends Error {
  constructor() { super('Session expired due to inactivity'); }
}

const IDLE_MIN = 30;

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const req = new Request('http://local', { headers: { cookie: cookieStore.toString() } });
    const res = new Response();

    const session = await getIronSession<SessionData>(req as any, res as any, sessionOptions);
    if (!session.userId) throw new Error('Unauthenticated');

    const now = Date.now();
    const lastActive = Number(session.lastActivityAt ?? 0);
    const idleLimit = IDLE_MS;
    if (lastActive && now - lastActive > idleLimit) {
      await session.destroy();
      throw new UnauthorizedExpired();
    }

    // Cache first
    const cached = await getCachedUser(session.userId);
    if (cached) {
      try {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return parsed;
      } catch {
        // Fallback to raw cached object if JSON.parse fails
        return cached as any;
      }
    }

    const user = await convexHttp.query(api.users.getCurrentUser, { userId: session.userId as any });
    if (!user || user.account?.suspended) return null;

    session.lastActivityAt = now;
    await session.save();

    await setCachedUser(session.userId, user, 60);
    return user;
  } catch (error) {
    console.error('[getCurrentUser] error', error);
    return null;
  }
}
