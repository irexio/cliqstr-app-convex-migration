/**
 * 🛠️ APA-HARDENED ROUTE: POST /api/cliqs/[id]/notices/admin
 *
 * Purpose:
 *   - Allows cliq owners to create admin notices
 *   - Used for announcements, reminders, schedule changes
 *   - Only accessible to cliq owners/moderators
 *
 * Auth:
 *   - Requires valid session (user.id)
 *   - User must be the owner of the cliq
 *
 * Body:
 *   - content: string (notice message)
 *   - expiresAt?: string (optional expiration date)
 *
 * Returns:
 *   - 200 OK + created notice
 *   - 401 if unauthorized
 *   - 403 if not cliq owner
 *   - 400 if invalid input
 *   - 500 on error
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';

const schema = z.object({
  content: z.string().min(1).max(500),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cliqId } = await params;
    
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is the owner of this cliq
    const cliq = await prisma.cliq.findUnique({
      where: { id: cliqId },
      select: { ownerId: true, name: true }
    });

    if (!cliq) {
      return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    }

    if (cliq.ownerId !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied: Only cliq owners can create admin notices' 
      }, { status: 403 });
    }

    // Validate request body
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: parsed.error.errors 
      }, { status: 400 });
    }

    const { content, expiresAt } = parsed.data;

    // Create admin notice
    const notice = await prisma.cliqNotice.create({
      data: {
        cliqId,
        type: 'admin',
        content,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    console.log(`[ADMIN_NOTICE] Created notice for cliq ${cliqId} by user ${user.id}`);
    
    return NextResponse.json({ 
      notice,
      success: true,
      message: 'Admin notice created successfully'
    });

  } catch (error) {
    console.error('[ADMIN_NOTICE_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * 🗑️ DELETE /api/cliqs/[id]/notices/admin/[noticeId]
 * Allow cliq owners to delete their admin notices
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cliqId } = await params;
    const url = new URL(req.url);
    const noticeId = url.pathname.split('/').pop();

    if (!noticeId) {
      return NextResponse.json({ error: 'Notice ID required' }, { status: 400 });
    }
    
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns the cliq and the notice exists
    const notice = await prisma.cliqNotice.findFirst({
      where: {
        id: noticeId,
        cliqId,
        type: 'admin'
      },
      include: {
        cliq: {
          select: { ownerId: true }
        }
      }
    });

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    if (notice.cliq.ownerId !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied: Only cliq owners can delete admin notices' 
      }, { status: 403 });
    }

    // Delete the notice
    await prisma.cliqNotice.delete({
      where: { id: noticeId }
    });

    console.log(`[ADMIN_NOTICE] Deleted notice ${noticeId} from cliq ${cliqId}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin notice deleted successfully'
    });

  } catch (error) {
    console.error('[DELETE_ADMIN_NOTICE_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
