// 🔐 APA-HARDENED — Get pending invite requests for a parent
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // APA: Only allow parents (check Account, not Profile)
  if (!user.account || user.account.role !== 'Parent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const inviteRequests = await prisma.inviteRequest.findMany({
    where: {
      inviterId: user.id,
      status: 'pending',
    },
    include: {
      cliq: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ inviteRequests });
}
