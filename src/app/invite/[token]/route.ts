import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth/session-config';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { token } = await params;
  
  console.log('[INVITE_TOKEN] Processing token:', token);

  try {
    // Validate invite token
    const invite = await prisma.invite.findUnique({
      where: { token },
      select: {
        id: true,
        cliqId: true,
        status: true,
        used: true,
        targetState: true,
        expiresAt: true,
        inviteType: true,
        friendFirstName: true,
        friendLastName: true,
        trustedAdultContact: true,
        invitedRole: true,
      }
    });

    console.log('[INVITE_TOKEN] Prisma result:', {
      found: !!invite,
      id: invite?.id,
      status: invite?.status,
      used: invite?.used,
      expired: invite?.expiresAt ? invite.expiresAt < new Date() : false
    });

    // Check if invite exists - 302 to join-invalid
    if (!invite) {
      console.log('[INVITE_TOKEN] No invite found, 302 to /join-invalid');
      return NextResponse.redirect(new URL('/join-invalid', request.url), 302);
    }

    // Check if invite is expired - 302 to join-expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      console.log('[INVITE_TOKEN] Invite expired, 302 to /join-expired');
      return NextResponse.redirect(new URL('/join-expired', request.url), 302);
    }

    // Check if invite is already completed/used/canceled - 302 to join-expired
    if (invite.status === 'completed' || invite.status === 'canceled' || invite.used) {
      console.log('[INVITE_TOKEN] Invite already used/completed/canceled, 302 to /join-expired');
      return NextResponse.redirect(new URL('/join-expired', request.url), 302);
    }

    // Valid invite - set bulletproof pending_invite cookie and 302 redirect
    const cookieJson = JSON.stringify({ 
      inviteId: invite.id,
      cliqId: invite.cliqId,
      inviteType: invite.inviteType,
      friendFirstName: invite.friendFirstName,
      friendLastName: invite.friendLastName 
    });
    const cookieValue = Buffer.from(cookieJson, 'utf-8').toString('base64url');
    
    console.log('[INVITE_TOKEN] Setting bulletproof cookie and deleting legacy variants:', { cookieJson, cookieValue, inviteId: invite.id });
    // Determine redirect based on invite type
    const nextPath = invite.inviteType === 'child' ? '/parents/hq' : '/choose-plan';
    const redirectUrl = new URL(nextPath, request.url);
    const res = NextResponse.redirect(redirectUrl, 302);
    
    // Determine if we're in production based on URL
    const isProduction = request.url.includes('cliqstr.com');
    console.log('[INVITE_TOKEN] Environment detection:', { 
      url: request.url, 
      isProduction,
      host: request.headers.get('host')
    });
    
    // Set the canonical Base64-URL cookie with proper domain handling
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 604800, // 7 days (604800 seconds)
      // For production, set domain to work with both apex and www
      // For Vercel deployments, don't set domain to avoid cross-domain issues
      ...(isProduction && request.url.includes('cliqstr.com') ? { domain: '.cliqstr.com' } : {})
    };
    
    console.log('[INVITE_TOKEN] Cookie options:', cookieOptions);
    
    res.cookies.set('pending_invite', cookieValue, cookieOptions);

    // Also persist inviteId into iron-session for server-side step detection
    try {
      const currentCookies = cookies();
      const reqForSession = new NextRequest(request.url, {
        headers: { cookie: currentCookies.toString() },
      });
      const resForSession = NextResponse.next();
      const iron = await getIronSession<any>(reqForSession, resForSession, sessionOptions);
      iron.inviteId = invite.id;
      await iron.save();
      // Merge any Set-Cookie headers produced by iron-session into our redirect response
      const setCookie = resForSession.headers.get('set-cookie');
      if (setCookie) {
        res.headers.append('set-cookie', setCookie);
      }
      console.log('[INVITE_TOKEN] Saved inviteId to iron-session:', invite.id);
    } catch (sessionErr) {
      console.error('[INVITE_TOKEN] Failed to persist inviteId in iron-session:', sessionErr);
    }

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

    console.log('[INVITE_TOKEN] Cookie set, iron-session updated, 302 to', redirectUrl.pathname);
    
    return res;

  } catch (error) {
    console.error('[INVITE_TOKEN] Unexpected error:', error);
    // On unexpected exceptions: 302 to join-invalid (don't render error page)
    return NextResponse.redirect(new URL('/join-invalid', request.url), 302);
  }
}

