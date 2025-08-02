/**
 * 🔐 APA-HARDENED — Invite Decline Handler
 * 
 * Purpose: Allows parents to decline child invites to cliqs
 * Method: GET (simple link from email)
 * 
 * Flow:
 * 1. Validate invite code
 * 2. Mark invite as declined
 * 3. Log decline timestamp
 * 4. Redirect to confirmation page
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const inviteCode = url.searchParams.get('code');

    if (!inviteCode) {
      console.log('[INVITE_DECLINE] Missing invite code');
      return NextResponse.redirect(new URL('/invite/declined?error=invalid', req.url));
    }

    // Normalize and find the invite
    const normalizedCode = normalizeInviteCode(inviteCode);
    const invite = await prisma.invite.findUnique({
      where: { code: normalizedCode }
    });

    if (!invite) {
      console.log('[INVITE_DECLINE] Invite not found:', normalizedCode);
      return NextResponse.redirect(new URL('/invite/declined?error=notfound', req.url));
    }

    // Check if invite is already used or declined
    if (invite.status === 'declined') {
      console.log('[INVITE_DECLINE] Invite already declined:', normalizedCode);
      return NextResponse.redirect(new URL('/invite/declined?status=already', req.url));
    }

    if (invite.status === 'used') {
      console.log('[INVITE_DECLINE] Invite already used:', normalizedCode);
      return NextResponse.redirect(new URL('/invite/declined?error=used', req.url));
    }

    // Mark invite as declined
    await prisma.invite.update({
      where: { code: normalizedCode },
      data: {
        status: 'declined'
      }
    });

    console.log('[INVITE_DECLINE] Successfully declined invite:', normalizedCode);
    
    // Redirect to confirmation page
    return NextResponse.redirect(new URL('/invite/declined', req.url));

  } catch (error) {
    console.error('[INVITE_DECLINE] Error declining invite:', error);
    return NextResponse.redirect(new URL('/invite/declined?error=server', req.url));
  }
}
