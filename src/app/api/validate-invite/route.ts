export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: GET /api/validate-invite
 *
 * Purpose:
 *   - Validates an invite code provided in the query string
 *   - Confirms the invite exists, is still pending, and is not expired
 *
 * Query Params:
 *   - code: string (invite code to validate)
 *
 * Returns:
 *   - 200 OK with cliqId, invitedRole, inviterId if valid
 *   - 400 if no code is provided
 *   - 404 if invite is not found
 *   - 410 if invite is already used or expired
 *
 * Used In:
 *   - Sign-up and onboarding flow to validate invite links
 *   - Early access or referral systems (optional future use)
 *
 * Related Routes:
 *   - /api/invite/create → issues new invite codes
 *   - /api/invite-request/approve → enables parent approval before invite creation
 *
 * Completion:
 *   ✅ Fully live and APA-compliant as of June 30, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Missing invite code' }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({
      where: { code },
      select: {
        cliqId: true,
        invitedRole: true,
        inviterId: true,
        status: true,
        expiresAt: true,
        inviteType: true,
        friendFirstName: true,
        trustedAdultContact: true,
        inviteNote: true,
        cliq: {
          select: {
            name: true
          }
        },
        inviter: {
          select: {
            email: true,
            profile: {
              select: {
                username: true
              }
            }
          }
        }
      },
    });

    if (!invite) {
      return NextResponse.json({ valid: false, error: 'Invite not found' }, { status: 404 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ valid: false, error: 'Invite already used' }, { status: 410 });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Invite expired' }, { status: 410 });
    }

    // Use type assertion to access fields that TypeScript doesn't know about yet
    // Get cliq name from the related cliq
    const cliqName = invite.cliq?.name || 'Unknown Cliq';
  
    // Get inviter information from the related user
    const inviter = invite.inviter || {};
    const inviterName = inviter.profile?.username || 
                       (inviter.email ? inviter.email.split('@')[0] : 'Someone');
  
    // Get the invite type and child's name if available
    const inviteType = invite.inviteType || 'adult';
    const friendFirstName = invite.friendFirstName;
  
    return NextResponse.json({
      valid: true,
      cliqId: invite.cliqId,
      role: invite.invitedRole,
      inviterId: invite.inviterId,
      cliqName,
      inviterName,
      inviteType,
      friendFirstName
    });
  } catch (error) {
    console.error('CRITICAL ERROR in validate-invite API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      valid: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
// 🔐 APA-HARDENED — Validate Invite Code from DB
