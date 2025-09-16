// Debug route to check authentication status
// ADMIN ONLY - requires admin authentication
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function GET(req: NextRequest) {
  try {
    // ADMIN AUTHENTICATION CHECK
    const adminSecret = req.headers.get('x-admin-secret');
    const expectedSecret = process.env.ADMIN_SECRET || 'cliqstr-admin-2025';
    if (adminSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    console.log("🔍 [ADMIN] Debugging auth status...");
    
    // Get the encrypted session using iron-session
    const session = await getIronSession<SessionData>(
      req,
      NextResponse.next(),
      sessionOptions
    );

    const debugInfo: any = {
      hasSession: !!session,
      sessionData: session ? {
        userId: session.userId,
        issuedAt: session.issuedAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
        idleCutoffMinutes: session.idleCutoffMinutes,
        inviteId: session.inviteId
      } : null,
      cookies: req.headers.get('cookie'),
      userAgent: req.headers.get('user-agent')
    };

    // If we have a session, try to get user data
    if (session?.userId) {
      try {
        const user = await convexHttp.query(api.users.getCurrentUser, {
          userId: session.userId as any,
        });
        debugInfo.userData = user;
      } catch (error) {
        debugInfo.userError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });
    
  } catch (error) {
    console.error("❌ Error debugging auth:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
