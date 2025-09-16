// Debug route to test session and authentication
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

    console.log("🔍 [ADMIN] Testing session and authentication...");
    
    // Get all cookies
    const allCookies = req.headers.get('cookie') || '';
    const cookieArray = allCookies.split(';').map(c => c.trim());
    
    // Get the encrypted session using iron-session
    const session = await getIronSession<SessionData>(
      req,
      NextResponse.next(),
      sessionOptions
    );

    const debugInfo = {
      timestamp: new Date().toISOString(),
      cookies: {
        total: cookieArray.length,
        all: cookieArray,
        cliqstrSession: cookieArray.find(c => c.startsWith('cliqstr-session=')),
        hasSessionCookie: !!cookieArray.find(c => c.startsWith('cliqstr-session='))
      },
      session: {
        exists: !!session,
        userId: session?.userId || null,
        issuedAt: session?.issuedAt ? new Date(session.issuedAt).toISOString() : null,
        expiresAt: session?.expiresAt ? new Date(session.expiresAt).toISOString() : null,
        lastActivityAt: session?.lastActivityAt ? new Date(session.lastActivityAt).toISOString() : null,
        isExpired: session?.expiresAt ? session.expiresAt < Date.now() : null,
        idleCutoffMinutes: session?.idleCutoffMinutes || null
      }
    };

    // If we have a session, try to get user data
    if (session?.userId) {
      try {
        const user = await convexHttp.query(api.users.getCurrentUser, {
          userId: session.userId as any,
        });
        debugInfo.userData = {
          found: !!user,
          id: user?.id || null,
          email: user?.email || null,
          role: user?.account?.role || null,
          approved: user?.account?.isApproved || null,
          plan: user?.account?.plan || null,
          suspended: user?.account?.suspended || null
        };
      } catch (error) {
        debugInfo.userError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Test the auth status endpoint
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
      const statusRes = await fetch(`${baseUrl}/api/auth/status`, {
        headers: { cookie: allCookies },
        cache: 'no-store',
      });
      
      debugInfo.authStatusTest = {
        status: statusRes.status,
        ok: statusRes.ok,
        response: statusRes.ok ? await statusRes.json() : null
      };
    } catch (error) {
      debugInfo.authStatusError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });
    
  } catch (error) {
    console.error("❌ Error testing session:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
