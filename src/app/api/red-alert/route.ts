import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { sendParentAlert } from '@/lib/alerts';

// POST /api/red-alert
// Body: { cliqId: string, reason?: string }
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'Child' && user.role !== 'Adult') {
    return NextResponse.json({ error: 'Only children or adults can trigger Red Alert' }, { status: 403 });
  }
  const { cliqId, reason } = await req.json();
  if (!cliqId) {
    return NextResponse.json({ error: 'Missing cliqId' }, { status: 400 });
  }
  // Fetch cliq and memberships
  const cliq = await prisma.cliq.findUnique({
    where: { id: cliqId },
    include: { memberships: { include: { user: { include: { account: true } } } } },
  });
  if (!cliq) {
    return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
  }
  // Find parent(s) in cliq
  const parents = cliq.memberships.filter(m => m.user.account?.role === 'Parent');

  // Log alert for audit/moderation
  await prisma.redAlert.create({
    data: {
      cliqId,
      triggeredById: user.id,
      reason: reason || null,
      triggeredAt: new Date(),
    },
  });

  if (user.role === 'Child') {
    // Notify all parents in cliq (silent)
    if (parents.length > 0) {
      for (const parent of parents) {
        await sendParentAlert({
          parentId: parent.userId,
          cliqId,
          triggeredById: user.id,
          reason,
        });
      }
      return NextResponse.json({ ok: true, notified: true });
    } else {
      // No parents found: escalate to future moderation (stub)
      return NextResponse.json({ ok: true, notified: false, escalated: true });
    }
  } else if (user.role === 'Adult') {
    // Adult triggers: escalate to AI/human moderation (stub)
    return NextResponse.json({ ok: true, escalated: true });
  }
}

