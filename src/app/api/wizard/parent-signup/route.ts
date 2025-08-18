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
    
    // Parse pending_invite cookie (Base64-URL encoded JSON format)
    const pendingInviteCookie = cookieStore.get('pending_invite')?.value;
    console.log('[WIZARD] Pending invite cookie:', pendingInviteCookie);
    if (!pendingInviteCookie) {
      console.log('[WIZARD] No pending invite cookie found');
      return NextResponse.json({ ok: false, error: 'No pending invite' }, { status: 400 });
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
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          invitedUserId: user.id
          // Keep status as 'pending' - will be set to 'accepted' when child is created
          // Do NOT set used = true yet - keep invite alive
        }
      });

      return { user, account, profile };
    });

    // 🎯 Sol's Rule: Start iron-session
    const session = await getIronSession(cookieStore, sessionOptions);
    (session as any).userId = result.user.id;
    (session as any).createdAt = Date.now();
    await session.save();

    console.log('[WIZARD] Parent signup successful:', {
      userId: result.user.id,
      email: normalizedEmail,
      inviteId
    });

    // 🎯 Sol's Rule: Response with no redirect
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[WIZARD] Parent signup error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
