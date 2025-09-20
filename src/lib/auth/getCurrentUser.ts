// Server-only current user with iron-session, cache-first
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { convexHttp } from '@/lib/convex-server';
import { api } from '../../../convex/_generated/api';
import { getCachedUser, setCachedUser } from '@/lib/cache/userCache';

const IDLE_MS = (Number(process.env.SESSION_IDLE_MINUTES ?? 15)) * 60_000;
const ABSOLUTE_MINUTES = Number(process.env.SESSION_ABSOLUTE_MINUTES ?? 0); // 0 disables

export async function getCurrentUser() {
  try {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.userId) return null;

    const now = Date.now();
    const lastActive = Number(session.lastActivityAt ?? 0);
    const idleLimit = IDLE_MS;
    if (!lastActive) {
      session.lastActivityAt = now;
      await session.save();
    }
    if (lastActive && now - lastActive > idleLimit) {
      await session.destroy();
      return null;
    }

    // Absolute expiration: prefer explicit expiresAt, else env-based TTL from issuedAt/createdAt
    if (session.expiresAt && now > session.expiresAt) {
      await session.destroy();
      return null;
    }
    if (!session.expiresAt && ABSOLUTE_MINUTES > 0) {
      const base = Number(session.issuedAt ?? session.createdAt ?? 0);
      if (base && now - base > ABSOLUTE_MINUTES * 60_000) {
        await session.destroy();
        return null;
      }
    }

    // Cache first
    const cached = await getCachedUser(session.userId);
    if (cached) {
      try {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        // bump activity on cache hit as well
        session.lastActivityAt = now;
        await session.save();
        return parsed;
      } catch {
        // Fallback to raw cached object if JSON.parse fails
        session.lastActivityAt = now;
        await session.save();
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
