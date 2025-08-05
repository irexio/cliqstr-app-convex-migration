/**
 * 🔐 APA-HARDENED ROUTE: GET /api/parent-approval/validate
 *
 * Purpose:
 *   - Validates parent approval request
 *   - Returns child information for preview
 *
 * Query Params:
 *   - inviteCode: string (required)
 *   - childId: string (required)
 *
 * Returns:
 *   - 200 OK with child info if valid
 *   - 400 if missing required params
 *   - 404 if invite not found
 *   - 500 if server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const inviteCode = url.searchParams.get('inviteCode');

    if (!inviteCode) {
      return NextResponse.json({ error: 'Missing invite code' }, { status: 400 });
    }

    // Normalize the invite code
    const normalizedCode = normalizeInviteCode(inviteCode);

    // Find the invite with related data
    const invite = await prisma.invite.findUnique({
      where: { code: normalizedCode },
      include: {
        cliq: {
          select: { name: true }
        },
        inviter: {
          select: {
            myProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check if invite is expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    // Check if invite is already used
    if (invite.used) {
      return NextResponse.json({ error: 'Invite has already been used' }, { status: 409 });
    }

    // Extract child info from invite
    const childInfo = {
      firstName: invite.friendFirstName || 'Child',
      lastName: '', // Can be added later if needed
      age: undefined // Can be calculated if birthdate provided
    };

    // Get inviter name
    const inviterName = invite.inviter?.myProfile?.firstName && invite.inviter?.myProfile?.lastName
      ? `${invite.inviter.myProfile.firstName} ${invite.inviter.myProfile.lastName}`
      : invite.inviter?.myProfile?.firstName || 'Someone';

    // Get cliq name
    const cliqName = invite.cliq?.name || 'Unknown Cliq';

    return NextResponse.json({
      success: true,
      childInfo,
      inviterName,
      cliqName
    });
  } catch (error) {
    console.error('[PARENT_APPROVAL_VALIDATE_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: `Failed to validate parent approval request: ${errorMessage}` 
    }, { status: 500 });
  }
}
