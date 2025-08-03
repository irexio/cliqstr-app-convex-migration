export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: GET /api/parent-approval/start
 *
 * Purpose:
 *   - Initiates the parent approval flow for child invites
 *   - Validates the invite and redirects to appropriate approval page
 *   - Ensures proper APA compliance for child account creation
 *
 * Query Params:
 *   - code: string (required) - The invite code
 *
 * Returns:
 *   - Redirects to appropriate approval flow based on user status
 *
 * Security:
 *   - Requires user authentication
 *   - Validates invite is for child type
 *   - Enforces parent/guardian role requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';

export async function GET(req: NextRequest) {
  try {
    // Get the current user session using APA-compliant auth
    const user = await getCurrentUser();
    
    if (!user?.id) {
      // Redirect to sign-in with return URL
      const url = new URL('/sign-in', req.url);
      url.searchParams.set('returnTo', req.url);
      return NextResponse.redirect(url);
    }
    
    // Get invite code from query params
    const { searchParams } = new URL(req.url);
    const inviteCode = searchParams.get('code');
    
    if (!inviteCode) {
      console.error('[PARENT_APPROVAL] No invite code provided');
      return NextResponse.redirect(new URL('/?error=missing-invite-code', req.url));
    }
    
    // Find and validate the invite
    const invite = await prisma.invite.findUnique({
      where: { code: normalizeInviteCode(inviteCode) },
      include: {
        cliq: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            minAge: true,
            maxAge: true,
            privacy: true
          }
        }
      }
    });
    
    if (!invite) {
      console.error('[PARENT_APPROVAL] Invite not found:', inviteCode);
      return NextResponse.redirect(new URL('/?error=invite-not-found', req.url));
    }
    
    if (invite.status !== 'pending') {
      console.error('[PARENT_APPROVAL] Invite already used:', inviteCode);
      return NextResponse.redirect(new URL('/?error=invite-already-used', req.url));
    }
    
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      console.error('[PARENT_APPROVAL] Invite expired:', inviteCode);
      return NextResponse.redirect(new URL('/?error=invite-expired', req.url));
    }
    
    // Check if this is a child invite
    const typedInvite = invite as any;
    const inviteType = typedInvite.inviteType || 'adult';
    
    if (inviteType !== 'child') {
      console.error('[PARENT_APPROVAL] Not a child invite:', inviteCode);
      return NextResponse.redirect(new URL(`/invite/adult?code=${inviteCode}`, req.url));
    }
    
    // Verify the user is not a child
    if (user.role === 'Child') {
      console.error('[PARENT_APPROVAL] Child cannot approve child invites:', user.id);
      return NextResponse.redirect(new URL('/?error=child-cannot-approve', req.url));
    }
    
    // Check if user has a plan
    const userWithAccount = await prisma.user.findUnique({
      where: { id: user.id },
      include: { account: true }
    });
    
    if (!userWithAccount?.account?.plan) {
      console.log('[PARENT_APPROVAL] User has no plan, redirecting to choose-plan');
      // Store invite details for after plan selection
      const redirectUrl = new URL('/choose-plan', req.url);
      redirectUrl.searchParams.set('context', 'child-invite');
      redirectUrl.searchParams.set('inviteCode', inviteCode);
      return NextResponse.redirect(redirectUrl);
    }
    
    // User has plan, redirect to parent approval request flow
    console.log('[PARENT_APPROVAL] User has plan, starting parent approval request');
    const redirectUrl = new URL('/api/parent-approval/request', req.url);
    redirectUrl.searchParams.set('code', inviteCode);
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('[PARENT_APPROVAL_START_ERROR]', error);
    return NextResponse.redirect(new URL('/?error=server-error', req.url));
  }
}
