// 🔐 APA-HARDENED — Return cliq info via query param
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cliqId = searchParams.get('id');
    const user = await getCurrentUser();

    if (!user?.id || !cliqId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isMember = await prisma.membership.findFirst({
      where: { cliqId, userId: user.id },
    });

    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cliq = await prisma.cliq.findUnique({
      where: { id: cliqId },
      select: {
        id: true,
        name: true,
        description: true,
        privacy: true,
        createdAt: true,
        ownerId: true,
        bannerImage: true,
      },
    });

    if (!cliq) {
      return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    }

    return NextResponse.json({ cliq });
  } catch (err) {
    console.error('❌ Error fetching cliq:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
