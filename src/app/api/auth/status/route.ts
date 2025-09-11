import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/status
 * 
 * Returns the current authentication status and user data.
 * Used by middleware and session-sync for consistent auth state checking.
 * 
 * Returns:
 * - 200 OK with { user: UserData } if authenticated
 * - 200 OK with { user: null } if not authenticated
 * - 500 on server error
 */
export async function GET(req: NextRequest) {
  try {
    // Get the encrypted session using iron-session
    const session = await getIronSession<SessionData>(
      req,
      NextResponse.next(),
      sessionOptions
    );

    if (!session.userId) {
      console.log('[AUTH-STATUS] No session found');
      return NextResponse.json({ user: null });
    }

    // Check session expiration using the new session format
    const now = Date.now();
    
    // Check if session has expired based on expiresAt field
    if (session.expiresAt && session.expiresAt < now) {
      console.log(`[AUTH-STATUS] Session expired at ${new Date(session.expiresAt).toISOString()}`);
      return NextResponse.json({ user: null });
    }
    
    // Check idle timeout
    const idleTimeMs = session.idleCutoffMinutes ? session.idleCutoffMinutes * 60 * 1000 : 60 * 60 * 1000; // Default 1 hour
    if (session.lastActivityAt && (now - session.lastActivityAt) > idleTimeMs) {
      console.log(`[AUTH-STATUS] Session idle timeout exceeded`);
      return NextResponse.json({ user: null });
    }

    // Use Convex to get user data
    const user = await convexHttp.query(api.users.getCurrentUser, {
      userId: session.userId as any, // Convert string to Convex ID
    });

    if (!user) {
      console.warn('[AUTH-STATUS] User not found for session userId:', session.userId);
      return NextResponse.json({ user: null });
    }

    if (user.account?.suspended) {
      console.warn('[AUTH-STATUS] Suspended user attempted access:', session.userId);
      return NextResponse.json({ user: null });
    }

    console.log('[AUTH-STATUS] Authenticated user loaded:', {
      email: user.email,
      plan: user.account?.plan,
      role: user.account?.role,
      approved: user.account?.isApproved,
    });

    // Return consistent shape: always { user } (either UserData or null)
    return NextResponse.json({ user });
  } catch (error) {
    console.error('[AUTH-STATUS] Error checking auth status:', error);
    // On error, return null user (fail-safe)
    return NextResponse.json({ user: null });
  }
}
