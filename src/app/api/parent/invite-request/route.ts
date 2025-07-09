// src/app/api/parent/invite-request/route.ts

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.account?.role !== 'Parent') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
