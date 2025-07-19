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
      cliq: {
        select: {
          name: true
        }
      },
      inviter: {
        select: {
          name: true,
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
  const typedInvite = invite as any;
  
  // Get cliq name from the related cliq
  const cliqName = typedInvite.cliq?.name || 'Unknown Cliq';
  
  // Get inviter information from the related user
  const inviter = typedInvite.inviter || {};
  const inviterName = inviter.name || 
                     inviter.profile?.username || 
                     (inviter.email ? inviter.email.split('@')[0] : 'Someone');
  
  // Get the invite type and child's name if available
  const inviteType = typedInvite.inviteType || 'adult';
  const friendFirstName = typedInvite.friendFirstName;
  
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
}
// 🔐 APA-HARDENED — Validate Invite Code from DB
