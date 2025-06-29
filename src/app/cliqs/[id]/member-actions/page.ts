// 🔐 APA-HARDENED — Member Actions Handler (POST only) 062525
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const cliqId = params.id;

  if (!user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { action, targetUserId, newRole } = body;

  const membership = await prisma.membership.findFirst({
    where: {
      cliqId,
      userId: user.id,
      role: { in: ['OWNER', 'MODERATOR'] },
    },
  });

  if (!membership) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (action === 'changeRole' && newRole) {
    await prisma.membership.updateMany({
      where: { cliqId, userId: targetUserId },
      data: { role: newRole },
    });
    return new NextResponse('Role updated');
  }

  if (action === 'remove') {
    await prisma.membership.deleteMany({
      where: { cliqId, userId: targetUserId },
    });
    return new NextResponse('Member removed');
  }

  return new NextResponse('Invalid action', { status: 400 });
}
