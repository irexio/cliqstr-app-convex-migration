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

    // Find the invite by the normalized join code
    const invite = await prisma.invite.findUnique({
      where: { joinCode: normalizedCode },
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

    // Valid invite - redirect to canonical token route for unified handling
    // This ensures adult vs child routing is correct (child -> /parents/hq, adult -> /choose-plan)
    console.log('[RESOLVE_JOIN_CODE] Redirecting to canonical /invite/[token] route');
    return NextResponse.redirect(new URL(`/invite/${invite.token}`, request.url), 302);

  } catch (error) {
    console.error('[RESOLVE_JOIN_CODE] Unexpected error:', error);
    return NextResponse.redirect(new URL('/join-invalid', request.url), 302);
  }
}
