import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * 🎯 Sol's Server-Side Invite Accept Route Handler
 * 
 * Flow:
 * 1. Validate invite code
 * 2. Set pending_invite cookie (HttpOnly, Secure, SameSite=Lax, Max-Age=900)
 * 3. 303 redirect to /parents/hq (always)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const inviteCode = searchParams.get('code')?.trim();

  // 1. Require invite code
  if (!inviteCode) {
    return NextResponse.redirect(new URL('/invite/invalid', request.url));
  }

  try {
    // 2. Validate invite exists and is pending
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
      include: {
        cliq: {
          select: { id: true, name: true }
        }
      }
    });

    if (!invite || invite.status !== 'pending' || (invite.expiresAt && invite.expiresAt < new Date())) {
      return NextResponse.redirect(new URL('/invite/invalid', request.url));
    }

    // 3. Set pending_invite cookie (Sol's specification)
    const cookieStore = cookies();
    cookieStore.set('pending_invite', inviteCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.cliqstr.com' : undefined,
      maxAge: 900, // 15 minutes
      path: '/'
    });

    // 4. 303 redirect to /parents/hq (always, regardless of invite type)
    return NextResponse.redirect(new URL('/parents/hq', request.url), 303);

  } catch (error) {
    console.error('[INVITE_ACCEPT] Database error:', error);
    return NextResponse.redirect(new URL('/invite/invalid', request.url));
  }
}
