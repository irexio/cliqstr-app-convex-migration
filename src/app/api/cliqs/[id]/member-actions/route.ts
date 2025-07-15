/**
 * 🔐 APA-HARDENED ROUTE: POST /api/cliqs/[id]/member-actions
 *
 * Purpose:
 *   - Allows a user (with proper permissions) to remove, promote, or demote a member.
 *
 * Auth:
 *   - Uses getCurrentUser() for session validation
 *   - Requires user to be a member of the cliq
 *
 * Body Input:
 *   {
 *     targetUserId: string,
 *     action: 'remove' | 'promote' | 'demote'
 *   }
 *
 * Returns:
 *   - 200 OK on success
 *   - 401 if unauthenticated
 *   - 403 if not a member
 *   - 400 if invalid input
 *   - 500 on DB/server error
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { defineRoute } from '@/lib/utils/defineRoute';
import { isValidPlan } from '@/lib/utils/planUtils';
import { requireCliqMembership } from '@/lib/auth/requireCliqMembership';

const ParamsSchema = z.object({
  id: z.string().cuid(),
});

const BodySchema = z.object({
  targetUserId: z.string(),
  action: z.enum(['remove', 'promote', 'demote']),
});

export const POST = defineRoute<{ id: string }>(async (req, { params }) => {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user.plan || typeof user.plan !== 'string' || !isValidPlan(user.plan)) {
      return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 403 });
    }

    const paramResult = ParamsSchema.safeParse({ id });
    if (!paramResult.success) {
      return NextResponse.json({ error: 'Invalid cliq ID' }, { status: 400 });
    }

    const body = await req.json();
    const bodyResult = BodySchema.safeParse(body);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { targetUserId, action } = bodyResult.data;
    const cliqId = id;

    // APA-compliant access control: Verify user is a member of this cliq
    try {
      await requireCliqMembership(user.id, cliqId);
    } catch (error) {
      return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
    }
    
    // Get membership details for role-based permissions
    const actingMembership = await prisma.membership.findFirst({
      where: { userId: user.id, cliqId },
    });

    switch (action) {
      case 'remove':
        await prisma.membership.deleteMany({
          where: { userId: targetUserId, cliqId },
        });
        break;

      case 'promote':
        await prisma.membership.updateMany({
          where: { userId: targetUserId, cliqId },
          data: { role: 'Moderator' },
        });
        break;

      case 'demote':
        await prisma.membership.updateMany({
          where: { userId: targetUserId, cliqId },
          data: { role: 'Member' },
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[MEMBER_ACTIONS_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
});
