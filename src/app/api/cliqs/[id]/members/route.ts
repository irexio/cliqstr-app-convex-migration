/**
 * 🔐 APA-HARDENED ROUTE: GET /api/cliqs/[id]/members
 *
 * Purpose:
 *   - Returns all members of a cliq (with email + profile)
 *
 * Auth:
 *   - Requires user to be a member of the cliq
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { isValidPlan } from '@/lib/utils/planUtils';
import { prisma } from '@/lib/prisma';
import { requireCliqMembership } from '@/lib/auth/requireCliqMembership';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cliqId } = await params;

  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Simplified plan validation - only check if plan exists
  if (!user.plan) {
    console.log('[APA] User missing plan in /api/cliqs/[id]/members');
    return NextResponse.json({ error: 'Missing plan' }, { status: 403 });
  }

  // APA-compliant access control: Verify user is a member of this cliq
  try {
    await requireCliqMembership(user.id, cliqId);
  } catch (error) {
    return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
  }

  const memberships = await prisma.membership.findMany({
    where: { cliqId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              username: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ members: memberships });
}
