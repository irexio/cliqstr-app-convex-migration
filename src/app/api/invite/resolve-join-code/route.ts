import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { normalizeJoinCode } from '@/lib/auth/generateJoinCode';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    
    if (!code) {
      return NextResponse.redirect(new URL('/join-invalid', req.url));
    }

    // Try joinCode first (normalized), then fallback to token
    const normalizedCode = normalizeJoinCode(code);
    
    let invite = await prisma.invite.findFirst({
      where: {
        joinCode: normalizedCode,
        used: false,
        status: { in: ['pending', 'accepted'] }
      }
    });

    // If not found by joinCode, try as token
    if (!invite) {
      invite = await prisma.invite.findFirst({
        where: {
          token: code,
          used: false,
          status: { in: ['pending', 'accepted'] }
        }
      });
    }

    if (!invite) {
      return NextResponse.redirect(new URL('/join-invalid', req.url));
    }

    // Check if expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/join-expired', req.url));
    }

    // Set pending_invite cookie with standardized JSON format
    const cookieStore = await cookies();
    cookieStore.set('pending_invite', JSON.stringify({ inviteId: invite.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: '.cliqstr.com',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    // Redirect to Parents HQ
    return NextResponse.redirect(new URL('/parents/hq#create-child', req.url));

  } catch (error) {
    console.error('[RESOLVE_JOIN_CODE] Error:', error);
    return NextResponse.redirect(new URL('/join-invalid', req.url));
  }
}
