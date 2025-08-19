import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { checkRateLimit, getClientIP } from '@/lib/auth/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime;
      const waitSeconds = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
      
      return NextResponse.json(
        { 
          ok: false,
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: waitSeconds
        }, 
        { status: 429 }
      );
    }

    console.log('[WIZARD] Parent signup request received');
    const cookieStore = await cookies();
    
    // Enhanced debugging for cookie issues
    const allCookies = cookieStore.getAll();
    console.log('[WIZARD] All cookies found:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    // Parse pending_invite cookie (Base64-URL encoded JSON format)
    const pendingInviteCookie = cookieStore.get('pending_invite')?.value;
    console.log('[WIZARD] Pending invite cookie raw value:', pendingInviteCookie);
    console.log('[WIZARD] Cookie exists:', !!pendingInviteCookie);
    
    if (!pendingInviteCookie) {
      console.log('[WIZARD] No pending invite cookie found - checking for legacy variants');
      const legacyCookie = cookieStore.get('pending_invite_legacy')?.value;
      console.log('[WIZARD] Legacy cookie found:', !!legacyCookie);
      
      return NextResponse.json({ 
        ok: false, 
        error: 'No pending invite cookie found. Please click the invite link again.',
        debug: {
          allCookies: allCookies.map(c => c.name),
          pendingInvite: !!pendingInviteCookie,
          legacy: !!legacyCookie
        }
      }, { status: 400 });
    }

    let inviteId;
    try {
      // Try Base64-URL format first
      try {
        const decodedJson = Buffer.from(pendingInviteCookie, 'base64url').toString('utf-8');
        const parsed = JSON.parse(decodedJson);
        inviteId = parsed.inviteId;
        console.log('[WIZARD] Parsed inviteId (Base64-URL):', inviteId);
      } catch (base64Error) {
        // Fallback to legacy JSON format
        console.log('[WIZARD] Base64-URL decode failed, trying legacy JSON format');
        const parsed = JSON.parse(decodeURIComponent(pendingInviteCookie));
        inviteId = parsed.inviteId;
        console.log('[WIZARD] Parsed inviteId (legacy JSON):', inviteId);
      }
    } catch (e) {
      console.error('[WIZARD] Cookie decode error:', e);
      return NextResponse.json({ ok: false, error: 'Invalid pending invite cookie' }, { status: 400 });
    }

    // Parse request body
    const { firstName, lastName, email, birthdate, password, plan } = await request.json();
    console.log('[WIZARD] Request data:', { firstName, lastName, email, birthdate: !!birthdate, password: !!password, plan });
    
    if (!firstName || !lastName || !email || !birthdate || !password) {
      console.log('[WIZARD] Missing required fields');
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Sol's Rule: Normalize email (trim+lower)
    const normalizedEmail = email.trim().toLowerCase();

    // 🎯 Sol's Rule: Validate invite (not expired)
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      select: {
        id: true,
        expiresAt: true,
        status: true,
        cliqId: true
      }
    });

    if (!invite || invite.status !== 'pending' || (invite.expiresAt && invite.expiresAt < new Date())) {
      console.log('[WIZARD] Invalid invite:', { invite, status: invite?.status, expired: invite?.expiresAt && invite.expiresAt < new Date() });
      return NextResponse.json({ ok: false, error: 'Invalid or expired invite' }, { status: 400 });
    }
    
    console.log('[WIZARD] Starting database transaction');

    // 🎯 Sol's Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Hash password with bcrypt
      const hashedPassword = await hash(password, 12);

      // Upsert User
      const user = await tx.user.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          password: hashedPassword
        },
        update: {
          password: hashedPassword // Update password if user exists
        }
      });

      // Upsert Account for user
      const account = await tx.account.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          role: 'Parent',
          isApproved: true,
          plan: 'test',
          birthdate: new Date(birthdate)
        },
        update: {
          role: 'Parent',
          isApproved: true,
          plan: 'test',
          birthdate: new Date(birthdate)
        }
      });

      // Create/Upsert MyProfile with firstName, lastName
      const profile = await tx.myProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.random().toString(36).slice(2, 6)}`,
          birthdate: new Date(birthdate)
        },
        update: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthdate: new Date(birthdate)
        }
      });

      // Update Invite - Sol's Rule: Keep it alive until final step
      // DO NOT set invitedUserId yet - that should be the child's ID, not the parent's
      // The invite remains pending until the child account is created
      console.log('[WIZARD] Keeping invite alive for child creation, not updating invitedUserId');

      return { user, account, profile };
    });

    console.log('[WIZARD] Parent signup successful:', {
      userId: result.user.id,
      email: normalizedEmail,
      inviteId
    });

    // 🎯 Sol's Rule: Create response first, then set session on it (like sign-in route)
    const response = NextResponse.json({ ok: true });
    
    // Set encrypted session with policy using NextRequest and NextResponse
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    const now = Date.now();
    const timeoutMins = 7 * 24 * 60; // 7 days
    const idleCutoffMins = 60; // 1 hour idle timeout
    const refreshIntervalMins = 15; // Refresh every 15 minutes
    
    session.userId = result.user.id;
    session.createdAt = now; // legacy field
    session.issuedAt = now;
    session.lastActivityAt = now;
    session.lastAuthAt = now;
    session.expiresAt = now + timeoutMins * 60 * 1000;
    session.idleCutoffMinutes = idleCutoffMins;
    session.refreshIntervalMinutes = refreshIntervalMins;
    
    console.log('[WIZARD] Session data prepared, attempting save...');
    await session.save();
    console.log('[WIZARD] Session saved successfully');

    // Set headers for caching and expiry hint
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Session-Expires-At', new Date(session.expiresAt).toISOString());

    return response;

  } catch (error) {
    console.error('[WIZARD] Parent signup error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
