// src/app/api/my-cliqs/route.ts

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberships = await prisma.membership.findMany({
      where: {
        userId: user.id,
      },
      include: {
        cliq: {
          select: {
            id: true,
            name: true,
            description: true,
            privacy: true,
            createdAt: true,
            ownerId: true,
          },
        },
      },
    });

    const cliqs = memberships.map((m) => m.cliq);

    return NextResponse.json({ cliqs });
  } catch (err) {
    console.error('Error fetching cliqs:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
