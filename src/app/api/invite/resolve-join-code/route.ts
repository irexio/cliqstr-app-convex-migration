import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { normalizeJoinCode } from '@/lib/auth/generateJoinCode';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { joinCode } = body;

    console.log('[RESOLVE_JOIN_CODE] Processing join code:', joinCode);

    if (!joinCode) {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
    }

    // Normalize the join code
    const normalizedCode = normalizeJoinCode(joinCode);
    console.log('[RESOLVE_JOIN_CODE] Normalized code:', normalizedCode);

    // Find the invite by the normalized code
    const invite = await prisma.invite.findUnique({
      where: { code: normalizedCode },
      select: {
        id: true,
        status: true,
        used: true,
        expiresAt: true,
        token: true,
      }
    });

    console.log('[RESOLVE_JOIN_CODE] Prisma result:', {
      found: !!invite,
      id: invite?.id,
      status: invite?.status,
      used: invite?.used,
      expired: invite?.expiresAt ? invite.expiresAt < new Date() : false
    });

    if (!invite) {
      console.log('[RESOLVE_JOIN_CODE] No invite found, 302 to /join-invalid');
      return NextResponse.redirect(new URL('/join-invalid', request.url), 302);
    }

    // Check if invite is expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      console.log('[RESOLVE_JOIN_CODE] Invite expired, 302 to /join-expired');
      return NextResponse.redirect(new URL('/join-expired', request.url), 302);
    }

    // Check if invite is already used/completed/canceled
    if (invite.status === 'completed' || invite.status === 'canceled' || invite.used) {
      console.log('[RESOLVE_JOIN_CODE] Invite already used/completed/canceled, 302 to /join-expired');
      return NextResponse.redirect(new URL('/join-expired', request.url), 302);
    }

    // Valid invite - set bulletproof pending_invite cookie
    const cookieJson = JSON.stringify({ inviteId: invite.id });
    const cookieValue = Buffer.from(cookieJson, 'utf-8').toString('base64url');
    
    console.log('[RESOLVE_JOIN_CODE] Set pending_invite cookie and redirect to PHQ');
    
    const res = NextResponse.redirect(new URL('/parents/hq', request.url), 302);
    
    // Determine if we're in production based on URL
    const isProduction = request.url.includes('cliqstr.com');
    
    // Set the canonical Base64-URL cookie with proper domain handling
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 86400, // 24 hours
      ...(isProduction ? { domain: '.cliqstr.com' } : {})
    };
    
    res.cookies.set('pending_invite', cookieValue, cookieOptions);

    // Clean up any legacy cookie variants with wrong domain (only if in production)
    if (isProduction) {
      // Delete cookie without domain specifier (if it exists from dev/preview)
      res.cookies.set('pending_invite_legacy', '', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: new Date(0)
      });
    }

    console.log('[RESOLVE_JOIN_CODE] Bulletproof cookie set, returning success');

    return res;

  } catch (error) {
    console.error('[RESOLVE_JOIN_CODE] Unexpected error:', error);
    return NextResponse.redirect(new URL('/join-invalid', request.url), 302);
  }
}
