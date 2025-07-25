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
    const childId = url.searchParams.get('childId');

    if (!inviteCode || !childId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Normalize the invite code
    const normalizedCode = normalizeInviteCode(inviteCode);

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { code: normalizedCode },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // For parent approval requests, the childId might be the invite code itself
    // or it might be an actual user ID if the child already started sign-up
    // Define the type for childInfo
    type ChildInfo = {
      firstName: string;
      lastName: string;
      age?: number;
    };
    
    let childInfo: ChildInfo | null = null;

    if (invite.inviteType === 'parent-approval') {
      // Extract child info from the invite
      childInfo = {
        firstName: invite.friendFirstName || 'Child',
        lastName: ''
        // age is optional, so we don't need to set it
      };

      // If we have additional info in the invite note, try to parse it
      if (invite.inviteNote) {
        const match = invite.inviteNote.match(/Child approval request for (.*?) (.*?), age (\d+)/);
        if (match) {
          childInfo.firstName = match[1];
          childInfo.lastName = match[2];
          childInfo.age = parseInt(match[3], 10) || undefined;
        }
      }
    } else {
      // Try to find the child user
      const childUser = await prisma.user.findUnique({
        where: { id: childId },
        include: {
          myProfile: true,
        },
      });

      if (childUser && childUser.myProfile) {
        // Calculate age from birthdate
        const birthdate = childUser.myProfile.birthdate;
        const ageDifMs = Date.now() - birthdate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        childInfo = {
          firstName: childUser.myProfile.firstName || 'Child',
          lastName: childUser.myProfile.lastName || '',
          age: age
        };
      }
    }

    if (!childInfo) {
      return NextResponse.json({ error: 'Child information not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      childInfo,
    });
  } catch (error) {
    console.error('[PARENT_APPROVAL_VALIDATE_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: `Failed to validate parent approval request: ${errorMessage}` 
    }, { status: 500 });
  }
}
