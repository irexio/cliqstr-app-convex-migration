/**
 * 🔐 APA-SAFE LOGIN ROUTE — FINAL VERSION
 *
 * Authenticates user with email/password,
 * verifies child approval,
 * issues secure session cookie via NextResponse headers.
 *
 * ✅ No persistent tokens used
 * ✅ Role and approval validation
 * ✅ Secure session-based auth only
 * ✅ Legacy tokens cleared
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { clearAuthTokens } from '@/lib/auth/enforceAPA';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { logLogin } from '@/lib/auth/userActivityLogger';
import { checkRateLimit, getClientIP } from '@/lib/auth/rateLimiter';

function parseIdentifier(raw: string) {
  const id = (raw || '').trim();
  return id.includes('@')
    ? { email: id.toLowerCase(), username: null }
    : { email: null, username: id };
}

// NUCLEAR CACHE BUST - Force complete refresh
export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimitResult = checkRateLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime;
      const waitSeconds = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
      
      return NextResponse.json(
        { 
          error: 'Too many sign-in attempts. Please try again later.',
          retryAfter: waitSeconds
        }, 
        { status: 429 }
      );
    }

    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const { email, username } = parseIdentifier(identifier);

    let user: any = null;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: { myProfile: true, account: true },
      });
    } else if (username) {
      // Resolve via profile username -> user
      const profile = await prisma.myProfile.findUnique({
        where: { username },
        include: { user: { include: { myProfile: true, account: true } } },
      });
      user = profile?.user || null;
    }

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials', reason: 'user_not_found' }, { status: 401 });
    }

    const isCorrectPassword = await compare(password, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 🚫 Block deleted/suspended users
    if (user.deletedAt) {
      const headers = new Headers();
      clearAuthTokens(headers);
      return NextResponse.json(
        { error: 'Account deleted', reason: 'deleted' },
        { status: 403, headers }
      );
    }
    if (user.account?.suspended) {
      const headers = new Headers();
      clearAuthTokens(headers);
      return NextResponse.json(
        { error: 'Account suspended', reason: 'suspended' },
        { status: 403, headers }
      );
    }

    // 🔒 Block unapproved children (APA: check Account, not Profile)
    if (user.account?.role?.toLowerCase() === 'child' && !user.account?.isApproved) {
      console.log('🚫 Sign-in denied - child not approved:', user.email);
      
      // Create response with headers to clear any legacy tokens
      const headers = new Headers();
      clearAuthTokens(headers);
      
      return NextResponse.json(
        { error: 'Awaiting parent approval', redirectUrl: '/awaiting-approval' },
        { status: 403, headers }
      );
    }
    
    // Check if adult user has verified their email
    // We determine this by checking if verificationToken exists
    // If token exists, they haven't verified their email yet
    if (user.account?.role?.toLowerCase() !== 'child' && user.verificationToken) {
      console.log('🚫 Sign-in denied - email not verified:', user.email);
      
      // Create response with headers to clear any legacy tokens
      const headers = new Headers();
      clearAuthTokens(headers);
      
      return NextResponse.json(
        { error: 'Email not verified', redirectUrl: '/verification-pending', email: user.email },
        { status: 403, headers }
      );
    }
    
    // Redirect unapproved users to complete signup
    // Check isApproved on both User and Account models for compatibility
    const isUserApproved = user.account?.isApproved ?? false;
    
    // DEBUG: Log account data for parent invite debugging
    console.log('[SIGNIN_DEBUG] User account data:', {
      email: user.email,
      role: user.account?.role,
      isApproved: user.account?.isApproved,
      plan: user.account?.plan,
      isUserApproved
    });
    
    if (!isUserApproved) {
      console.log(`[⚠️] Unapproved user login — redirecting to onboarding: ${user.email}`);
      
      // Set session cookie to maintain authentication
      const response = NextResponse.json({
        success: true,
        redirectUrl: '/choose-plan',
        user: {
          id: user.id,
          role: user.account?.role || 'Adult',
        },
      });
      
      // Clear any legacy tokens
      clearAuthTokens(response.headers);
      
      // Set encrypted session with policy
      const session = await getIronSession<SessionData>(req, response, sessionOptions);
      const now = Date.now();
      const timeoutMins = Number(process.env.SESSION_TIMEOUT_MINUTES || 180);
      const refreshIntervalMins = Number(process.env.SESSION_REFRESH_INTERVAL_MINUTES || 20);
      const idleCutoffMins = Number(process.env.SESSION_IDLE_CUTOFF_MINUTES || 60);
      session.userId = user.id;
      session.createdAt = now; // legacy
      session.issuedAt = now;
      session.lastActivityAt = now;
      session.lastAuthAt = now;
      session.expiresAt = now + timeoutMins * 60 * 1000;
      session.idleCutoffMinutes = idleCutoffMins;
      session.refreshIntervalMinutes = refreshIntervalMins;
      await session.save();

      // Set headers for caching and expiry hint
      response.headers.set('Cache-Control', 'private, no-store');
      response.headers.set('X-Session-Expires-At', new Date(session.expiresAt).toISOString());
      
      // Log login activity for unapproved user
      await logLogin(user.id, req);
      
      return response;
    }

    //  Set secure session cookie with user.id (APA-compliant)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.account?.role || 'Adult',
      },
    });
    
    // Clear any legacy tokens that might exist
    clearAuthTokens(response.headers);

    // Set encrypted session with policy
    const session = await getIronSession<SessionData>(req, response, sessionOptions);
    const now = Date.now();
    const timeoutMins = Number(process.env.SESSION_TIMEOUT_MINUTES || 180);
    const refreshIntervalMins = Number(process.env.SESSION_REFRESH_INTERVAL_MINUTES || 20);
    const idleCutoffMins = Number(process.env.SESSION_IDLE_CUTOFF_MINUTES || 60);
    session.userId = user.id;
    session.createdAt = now; // legacy
    session.issuedAt = now;
    session.lastActivityAt = now;
    session.lastAuthAt = now;
    session.expiresAt = now + timeoutMins * 60 * 1000;
    session.idleCutoffMinutes = idleCutoffMins;
    session.refreshIntervalMinutes = refreshIntervalMins;
    await session.save();

    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Session-Expires-At', new Date(session.expiresAt).toISOString());

    // Check for pending parent invite cookie (Sol's solution)
    const cookies = req.headers.get('cookie') || '';
    console.log('[SIGNIN_DEBUG] All cookies:', cookies);
    
    const pendingInviteMatch = cookies.match(/pending_invite=([^;]+)/);
    const pendingInviteCode = pendingInviteMatch ? decodeURIComponent(pendingInviteMatch[1]) : null;
    
    console.log('[SIGNIN_DEBUG] Pending invite cookie check:', {
      cookiesFound: !!cookies,
      pendingInviteMatch: !!pendingInviteMatch,
      pendingInviteCode,
      userRole: user.account?.role,
      isParentOrAdmin: user.account?.role === 'Parent' || user.account?.role === 'Admin'
    });
    
    if (pendingInviteCode && (user.account?.role === 'Parent' || user.account?.role === 'Admin')) {
      console.log('[SIGNIN] Parent invite cookie found, redirecting to Parents HQ with code:', pendingInviteCode);
      
      // Clear the pending invite cookie
      response.headers.set('Set-Cookie', 'pending_invite=; Max-Age=0; Path=/; SameSite=Lax; Secure');
      
      // Redirect to Parents HQ with invite code
      return NextResponse.redirect(new URL(`/parents/hq?inviteCode=${encodeURIComponent(pendingInviteCode)}`, req.url));
    } else {
      console.log('[SIGNIN_DEBUG] No parent invite redirect - either no cookie or not parent/admin role');
    }

    // Log login activity
    await logLogin(user.id, req);

    return response;
  } catch (err) {
    console.error('💥 Sign-in error:', err);

    if (err instanceof Error) {
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }

    return NextResponse.json(
      { error: 'Unable to sign in. Please try again later.' },
      { status: 500 }
    );
  }
}
