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

    // Valid invite - set pending_invite cookie with JSON format
    const cookieStore = await cookies();
    const cookieValue = JSON.stringify({ inviteId: invite.id });
    
    console.log('[RESOLVE_JOIN_CODE] Setting cookie:', { cookieValue, inviteId: invite.id });
    
    cookieStore.set('pending_invite', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    console.log('[RESOLVE_JOIN_CODE] Cookie set, returning success with redirect URL');

    // Return success with redirect URL
    return NextResponse.json({ 
      success: true, 
      redirectUrl: '/parents/hq#create-child' 
    });

  } catch (error) {
    console.error('[RESOLVE_JOIN_CODE] Unexpected error:', error);
    return NextResponse.redirect(new URL('/join-invalid', request.url), 302);
  }
}
