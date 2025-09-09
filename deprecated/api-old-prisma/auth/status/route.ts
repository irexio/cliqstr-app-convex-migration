// 🔐 APA-HARDENED FALLBACK ROUTE: GET /api/auth/status

import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Prepare response so we can attach headers/cookies when refreshing session
    const response = new NextResponse(null);

    // Load session to enforce timing policy and optionally refresh
    const session = await getIronSession<SessionData>(req, response, sessionOptions);

    const now = Date.now();
    const hasTiming = Boolean(session.expiresAt && session.lastActivityAt);
    if (session.userId && hasTiming) {
      const idleCutoffMs = (session.idleCutoffMinutes ?? Number(process.env.SESSION_IDLE_CUTOFF_MINUTES || 60)) * 60 * 1000;
      const refreshIntervalMs = (session.refreshIntervalMinutes ?? Number(process.env.SESSION_REFRESH_INTERVAL_MINUTES || 20)) * 60 * 1000;
      const baseWindowMs = Number(process.env.SESSION_TIMEOUT_MINUTES || 180) * 60 * 1000;

      // Idle cutoff
      if (now - session.lastActivityAt >= idleCutoffMs) {
        await session.destroy();
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'private, no-store');
        return new NextResponse(JSON.stringify({ user: null, reason: 'idle_timeout' }), { status: 200, headers });
      }

      // Absolute expiry
      if (now > session.expiresAt) {
        await session.destroy();
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'private, no-store');
        return new NextResponse(JSON.stringify({ user: null, reason: 'expired' }), { status: 200, headers });
      }

      // Sliding refresh (rate-limited)
      if (now - session.lastActivityAt >= refreshIntervalMs) {
        session.lastActivityAt = now;
        session.expiresAt = now + baseWindowMs;
        await session.save();
      }

      // Expose imminent expiry hint
      const imminentMs = Number(process.env.SESSION_IMMINENT_EXPIRY_MINUTES || 5) * 60 * 1000;
      if (session.expiresAt - now <= imminentMs) {
        response.headers.set('X-Session-Expires-At', new Date(session.expiresAt).toISOString());
      }

      response.headers.set('Cache-Control', 'private, no-store');
    }

    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ user: null }), { status: 200, headers: response.headers });
    }

    // getCurrentUser already returns all the data we need from Convex
    // Just return the user data in the expected format
    return new NextResponse(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        plan: user.account?.plan ?? null,
        role: user.account?.role ?? null,
        approved: user.account?.isApproved ?? null,
        profile: user.myProfile,
        account: user.account,
        isAwaitingApproval: user.account?.role === 'Child' && !user.account?.isApproved,
      }
    }), { status: 200, headers: response.headers });
  } catch (err) {
    console.error('❌ /api/auth/status error:', err);
    return NextResponse.json(
      { user: null, error: 'Session verification failed' },
      { status: 200 }
    );
  }
}
