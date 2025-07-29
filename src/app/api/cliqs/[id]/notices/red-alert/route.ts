/**
 * 🚨 APA-HARDENED ROUTE: POST /api/cliqs/[id]/notices/red-alert
 *
 * Purpose:
 *   - Creates red alert notices when safety concerns are reported
 *   - Automatically triggered by Red Alert button
 *   - Creates both "open" and "resolved" notices as needed
 *
 * Auth:
 *   - Requires valid session (user.id)
 *   - User must be a member of the cliq
 *
 * Body:
 *   - action: 'open' | 'resolve'
 *   - redAlertId?: string (for resolve action)
 *
 * Returns:
 *   - 200 OK + created notice
 *   - 401 if unauthorized
 *   - 403 if not cliq member
 *   - 400 if invalid input
 *   - 500 on error
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';

const schema = z.object({
  action: z.enum(['open', 'resolve']),
  redAlertId: z.string().optional(),
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

    // Verify user is a member of this cliq
    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        cliqId: cliqId
      }
    });

    if (!membership) {
      return NextResponse.json({ 
        error: 'Access denied: You are not a member of this cliq' 
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

    const { action, redAlertId } = parsed.data;

    let notice;

    if (action === 'open') {
      // Create "red alert open" notice
      notice = await prisma.cliqNotice.create({
        data: {
          cliqId,
          type: 'red_alert_open',
          content: '⚠️ A safety concern was reported in this cliq. Our team is reviewing it.',
          // Red alert notices don't expire until resolved
        }
      });

      console.log(`[RED_ALERT] Created open notice for cliq ${cliqId} by user ${user.id}`);

    } else if (action === 'resolve') {
      // Remove any existing "red alert open" notices
      await prisma.cliqNotice.deleteMany({
        where: {
          cliqId,
          type: 'red_alert_open'
        }
      });

      // Create "red alert resolved" notice (expires in 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      notice = await prisma.cliqNotice.create({
        data: {
          cliqId,
          type: 'red_alert_resolved',
          content: '✅ A recent Red Alert in this cliq has been reviewed and addressed.',
          expiresAt
        }
      });

      console.log(`[RED_ALERT] Created resolved notice for cliq ${cliqId}`);
    }
    
    return NextResponse.json({ 
      notice,
      success: true,
      message: `Red alert ${action} notice created successfully`
    });

  } catch (error) {
    console.error('[RED_ALERT_NOTICE_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * 🔍 GET /api/cliqs/[id]/notices/red-alert
 * Check if there are any active red alert notices for this cliq
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cliqId } = await params;
    
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a member of this cliq
    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        cliqId: cliqId
      }
    });

    if (!membership) {
      return NextResponse.json({ 
        error: 'Access denied: You are not a member of this cliq' 
      }, { status: 403 });
    }

    // Check for active red alert notices
    const activeRedAlert = await prisma.cliqNotice.findFirst({
      where: {
        cliqId,
        type: 'red_alert_open'
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      hasActiveRedAlert: !!activeRedAlert,
      activeRedAlert
    });

  } catch (error) {
    console.error('[CHECK_RED_ALERT_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
