export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: GET, PATCH, DELETE /api/cliqs/[id]
 *
 * Purpose:
 *   - GET: Fetch cliq metadata (requires membership)
 *   - PATCH: Update cliq info (owner only)
 *   - DELETE: Soft-delete cliq (owner only)
 *
 * Auth:
 *   - All methods use getCurrentUser()
 *   - PATCH/DELETE restricted to cliq owner
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { isValidPlan } from '@/lib/utils/planUtils';
import { requireCliqMembership } from '@/lib/auth/requireCliqMembership';

const ParamsSchema = z.object({
  id: z.string().cuid(),
});

const PatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  privacy: z.enum(['private', 'public', 'semi_private']).optional(), // ✅ Matches Prisma enum
  coverImage: z.string().url().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.plan || typeof user.plan !== 'string' || !isValidPlan(user.plan)) {
      return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 403 });
    }

    const parsed = ParamsSchema.safeParse({ id });
    if (!parsed.success) return NextResponse.json({ error: 'Invalid cliq ID' }, { status: 400 });
    
    // APA-compliant access control: Verify user is a member of this cliq
    try {
      await requireCliqMembership(user.id, parsed.data.id);
    } catch (error) {
      return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
    }

    const cliq = await prisma.cliq.findUnique({
      where: { id: parsed.data.id },
      include: {
        posts: {
          where: { deleted: false },
          select: {
            id: true,
            content: true,
            createdAt: true,
            deleted: true,
            image: true,
            authorId: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: { id: true, email: true, profile: true },
            },
          },
        },
      },
    });

    if (!cliq) return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });

    return NextResponse.json(cliq);
  } catch (err) {
    console.error('[GET_CLIQ_BY_ID_ERROR]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.plan || typeof user.plan !== 'string' || !isValidPlan(user.plan)) {
      return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 403 });
    }

    const parsed = ParamsSchema.safeParse({ id });
    if (!parsed.success) return NextResponse.json({ error: 'Invalid cliq ID' }, { status: 400 });
    
    // APA-compliant access control: Verify user is a member of this cliq
    try {
      await requireCliqMembership(user.id, id);
    } catch (error) {
      return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
    }

    const cliq = await prisma.cliq.findUnique({ where: { id } });
    if (!cliq) return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    if (cliq.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const rawBody = await req.json();

    // 🧼 Normalize any frontend legacy strings BEFORE validation
    if (rawBody.privacy === 'semi-private') {
      rawBody.privacy = 'semi_private';
    }
    
    const updates = PatchSchema.safeParse(rawBody);
    if (!updates.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    const updateData = updates.data;
    
    const updated = await prisma.cliq.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ cliq: updated });
  } catch (err) {
    console.error('[PATCH_CLIQ_ERROR]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.plan || typeof user.plan !== 'string' || !isValidPlan(user.plan)) {
      return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 403 });
    }

    const parsed = ParamsSchema.safeParse({ id });
    if (!parsed.success) return NextResponse.json({ error: 'Invalid cliq ID' }, { status: 400 });
    
    // APA-compliant access control: Verify user is a member of this cliq
    try {
      await requireCliqMembership(user.id, id);
    } catch (error) {
      return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
    }

    const cliq = await prisma.cliq.findUnique({ where: { id } });
    if (!cliq) return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    if (cliq.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.cliq.update({
      where: { id },
      data: { deleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE_CLIQ_ERROR]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
