export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const cliqId = url.pathname.split('/').at(-2); // get `[id]` before 'member-actions'

    if (!cliqId) {
      return NextResponse.json({ error: 'Missing cliq ID' }, { status: 400 });
    }

    const { action, targetUserId, newRole } = await req.json();

    if (!action || !targetUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requester = await prisma.membership.findFirst({
      where: { userId: currentUser.id, cliqId },
    });

    if (!requester || requester.role !== 'MASTER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'changeRole') {
      if (!newRole) {
        return NextResponse.json({ error: 'Missing newRole for role change' }, { status: 400 });
      }

      await prisma.membership.update({
        where: {
          userId_cliqId: {
            userId: targetUserId,
            cliqId,
          },
        },
        data: { role: newRole },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      await prisma.membership.delete({
        where: {
          userId_cliqId: {
            userId: targetUserId,
            cliqId,
          },
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (err) {
    console.error('Member actions error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
