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
  if (!user.plan || typeof user.plan !== 'string' || !isValidPlan(user.plan)) {
    return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 403 });
  }

  const isMember = await prisma.membership.findFirst({
    where: { cliqId, userId: user.id },
  });

  if (!isMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
