// 🔐 APA-HARDENED by Aiden — Do not remove without security review.
// This route fetches all cliqs for the authenticated user via membership links.
// Prisma client is loaded via custom `@/lib/prisma` import.

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { Membership } from '@prisma/client';

type MembershipWithCliq = Membership & {
  cliq: {
    id: string;
    name: string;
    description: string | null;
    privacy: string;
    createdAt: Date;
    ownerId: string;
  };
};

export async function GET() {
  try {
    const user = await getCurrentUser();

    const allowedRoles = ['admin', 'parent', 'child', 'adult'];

    if (
      !user ||
      !user.profile ||
      !user.profile.role ||
      !allowedRoles.includes(user.profile.role)
    ) {
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

    const cliqs = memberships.map((m: MembershipWithCliq) => m.cliq);

    return NextResponse.json({ cliqs });
  } catch (err) {
    console.error('Error fetching cliqs:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
