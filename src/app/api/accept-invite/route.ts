export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: POST /api/accept-invite
 *
 * Purpose:
 *   - Accepts an invite using the provided invite code
 *   - Adds the current user to the cliq
 *   - Marks the invite as used
 *   - Handles different invite types (adult vs child)
 *
 * Body Params:
 *   - inviteCode: string (required)
 *
 * Returns:
 *   - 200 OK with cliqId if successful
 *   - 400 if no code is provided
 *   - 401 if user is not authenticated
 *   - 404 if invite is not found
 *   - 410 if invite is already used or expired
 *
 * Security:
 *   - Requires user authentication
 *   - For child invites, requires adult verification
 *   - Enforces APA-compliant access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { logInviteAccept } from '@/lib/auth/userActivityLogger';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';
import { validateAgeRequirements } from '@/lib/utils/ageUtils';

export async function POST(req: NextRequest) {
  try {
    // Get the current user session using APA-compliant auth
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'You must be signed in to accept an invite' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await req.json();
    const { inviteCode, method } = body;
    
    if (!inviteCode) {
      return NextResponse.json({ error: 'Missing invite code' }, { status: 400 });
    }
    
    // Find the invite
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
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }
    
    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite already used' }, { status: 410 });
    }
    
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 410 });
    }
    
    // Use type assertion for new fields
    const typedInvite = invite as any;
    const inviteType = typedInvite.inviteType || 'adult';
    
    // Check if user is already a member of the cliq
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_cliqId: {
          userId: user.id,
          cliqId: invite.cliqId
        }
      }
    });
    
    if (existingMembership) {
      // Mark the invite as used
      await prisma.invite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          invitedUserId: user.id
        }
      });
      
      return NextResponse.json({
        message: 'You are already a member of this cliq',
        cliqId: invite.cliqId
      });
    }
    
    // Age gating validation using Account.birthdate (APA-safe)
    if (user.account?.birthdate) {
      const ageValidation = validateAgeRequirements(
        user.account.birthdate,
        invite.cliq.minAge,
        invite.cliq.maxAge
      );

      if (!ageValidation.isValid) {
        console.log(`[APA] Age restriction blocked user ${user.id} from accepting invite to cliq ${invite.cliqId}:`, ageValidation.reason);
        return NextResponse.json({ 
          error: `Age restriction: ${ageValidation.reason}` 
        }, { status: 403 });
      }
    }

    // ✅ APA COMPLIANCE: Handle child invites differently
    if (inviteType === 'child') {
      // For child invites, the current user is the PARENT/GUARDIAN
      // We need to redirect to the parent approval flow, not add them to the cliq
      console.log(`[APA] Child invite detected - redirecting to parent approval flow for user ${user.id}`);
      
      // Verify the user is an adult (has role 'Adult' or no role set)
      if (user.role === 'Child') {
        return NextResponse.json({ 
          error: 'Child accounts cannot approve child invites. Please have a parent or guardian complete this process.' 
        }, { status: 403 });
      }
      
      // Don't add the parent to the cliq yet - they need to go through parent approval
      // Return a special response indicating this is a child invite that needs parent approval
      return NextResponse.json({
        message: 'Child invite requires parent approval',
        inviteType: 'child',
        requiresParentApproval: true,
        cliqId: invite.cliqId,
        cliqName: invite.cliq.name,
        friendFirstName: typedInvite.friendFirstName
      });
    }
    
    // ✅ ADULT INVITES: Normal flow for adult-to-adult invites
    console.log(`[INVITE] Adult invite - adding user ${user.id} directly to cliq ${invite.cliqId}`);
    
    // Add the user to the cliq
    await prisma.membership.create({
      data: {
        userId: user.id,
        cliqId: invite.cliqId,
        role: invite.invitedRole || 'member'
      }
    });
    
    // Mark the invite as used
    await prisma.invite.update({
      where: { id: invite.id },
      data: {
        status: 'accepted',
        invitedUserId: user.id
      }
    });
    
    // Log the successful invite acceptance
    console.log(`[INVITE_ACCEPTED] User ${user.id} accepted invite to cliq ${invite.cliqId}`);
    const inviteMethod = method === 'manual' ? 'manual' : 'link';
    await logInviteAccept(user.id, inviteCode, inviteMethod, req);
    
    return NextResponse.json({
      message: 'Successfully joined cliq',
      cliqId: invite.cliqId
    });
    
  } catch (error) {
    console.error('[ACCEPT_INVITE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
  }
}
