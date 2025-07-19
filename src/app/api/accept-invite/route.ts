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
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in to accept an invite' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await req.json();
    const { inviteCode } = body;
    
    if (!inviteCode) {
      return NextResponse.json({ error: 'Missing invite code' }, { status: 400 });
    }
    
    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
      include: {
        cliq: {
          select: {
            id: true,
            name: true,
            ownerId: true
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
    const existingMembership = await prisma.cliqMember.findFirst({
      where: {
        cliqId: invite.cliqId,
        userId: session.user.id
      }
    });
    
    if (existingMembership) {
      // Mark the invite as used
      await prisma.invite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          invitedUserId: session.user.id
        }
      });
      
      return NextResponse.json({
        message: 'You are already a member of this cliq',
        cliqId: invite.cliqId
      });
    }
    
    // For child invites, we need to check if the user is an adult
    if (inviteType === 'child') {
      // Get the user's profile to check age verification status
      const userProfile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { isAgeVerified: true }
      });
      
      // For now, we'll just check if they have the isAgeVerified flag
      // In the future, this will be replaced with Stripe age verification
      if (!userProfile?.isAgeVerified) {
        return NextResponse.json({
          error: 'Adult verification required to accept child invites',
          requiresVerification: true
        }, { status: 403 });
      }
    }
    
    // Add the user to the cliq
    await prisma.cliqMember.create({
      data: {
        cliq: {
          connect: { id: invite.cliqId }
        },
        user: {
          connect: { id: session.user.id }
        },
        role: invite.invitedRole || 'member',
        status: 'active'
      }
    });
    
    // Mark the invite as used
    await prisma.invite.update({
      where: { id: invite.id },
      data: {
        status: 'accepted',
        invitedUserId: session.user.id
      }
    });
    
    // Log the successful invite acceptance
    console.log(`[INVITE_ACCEPTED] User ${session.user.id} accepted invite to cliq ${invite.cliqId}`);
    
    return NextResponse.json({
      message: 'Successfully joined cliq',
      cliqId: invite.cliqId
    });
    
  } catch (error) {
    console.error('[ACCEPT_INVITE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
  }
}
