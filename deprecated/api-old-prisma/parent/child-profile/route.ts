export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: GET /api/parent/child-profile
 *
 * Purpose:
 *   - Returns detailed child profile and settings for parent dashboard
 *   - Includes MyProfile data (name, birthdate) and ChildSettings
 *
 * Auth:
 *   - Requires a logged-in parent user
 *   - Validates parent is linked to the requested child
 *
 * Query Parameters:
 *   - childId: string (required) - ID of the child to fetch
 *
 * Returns:
 *   - 200 OK with { myProfile, childSettings }
 *   - 401 if not authenticated
 *   - 403 if not linked to child
 *   - 404 if child not found
 *   - 500 on server error
 *
 * Used In:
 *   - ParentDashboard.tsx (fetching detailed child data)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(req: Request) {
  try {
    const parent = await getCurrentUser();
    if (!parent?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 });
    }

    // 🔒 Ensure parent is linked to child
    const link = await prisma.parentLink.findFirst({
      where: {
        childId,
        email: parent.email,
      },
    });

    if (!link) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch child profile
    const childProfile = await prisma.myProfile.findUnique({
      where: { userId: childId },
      select: {
        id: true,
        username: true,
        firstName: true,
        birthdate: true,
      },
    });

    if (!childProfile) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 });
    }

    // Fetch or create child settings
    let childSettings = await prisma.childSettings.findUnique({
      where: { profileId: childProfile.id }
    });

    if (!childSettings) {
      // Create default settings if they don't exist
      childSettings = await prisma.childSettings.create({
        data: {
          profileId: childProfile.id,
          canSendInvites: false,
          inviteRequiresApproval: true,
          canCreatePublicCliqs: false,
          canPostImages: true,
        }
      });
    }

    return NextResponse.json({
      myProfile: {
        username: childProfile.username,
        firstName: childProfile.firstName,
        birthdate: childProfile.birthdate.toISOString(),
      },
      childSettings: {
        canSendInvites: childSettings.canSendInvites,
        canInviteChildren: false, // Default for now
        canInviteAdults: false, // Default for now
        childInviteRequiresApproval: childSettings.inviteRequiresApproval,
        adultInviteRequiresApproval: childSettings.inviteRequiresApproval,
        canCreatePrivateCliqs: false, // Default for now
        canCreateSemiPrivateCliqs: false, // Default for now
        canCreatePublicCliqs: childSettings.canCreatePublicCliqs,
        isSilentlyMonitored: true, // Default for now
      }
    });
  } catch (err) {
    console.error('[GET_CHILD_PROFILE_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
