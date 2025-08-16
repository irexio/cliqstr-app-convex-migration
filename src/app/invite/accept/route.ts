import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 🎯 Legacy Invite Accept Route - 302 Redirect to Token Route
 * 
 * Flow:
 * 1. Validate invite code exists
 * 2. Look up invite token
 * 3. 302 redirect to /invite/[token] (which sets standardized cookie)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const inviteCode = searchParams.get('code')?.trim();

  // 1. Require invite code
  if (!inviteCode) {
    return NextResponse.redirect(new URL('/invite/invalid', request.url));
  }

  try {
    // 2. Look up invite by code to get token
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
      select: { token: true, status: true, expiresAt: true }
    });

    if (!invite || invite.status !== 'pending' || (invite.expiresAt && invite.expiresAt < new Date())) {
      return NextResponse.redirect(new URL('/invite/invalid', request.url));
    }

    // 3. 302 redirect to token route (which will set standardized cookie)
    return NextResponse.redirect(new URL(`/invite/${invite.token}`, request.url), 302);

  } catch (error) {
    console.error('[INVITE_ACCEPT] Database error:', error);
    return NextResponse.redirect(new URL('/invite/invalid', request.url));
  }
}
