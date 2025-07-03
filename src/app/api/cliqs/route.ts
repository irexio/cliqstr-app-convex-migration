/**
 * 🔐 APA-HARDENED ROUTE: GET /api/cliqs?id={cliqId}
 *
 * Purpose:
 *   - Returns public info about a cliq based on the query parameter
 *   - Used when viewing cliq details safely without revealing private data
 *
 * Auth:
 *   - Requires user to be logged in
 *   - Requires user to be a member of the cliq
 *
 * Query Param:
 *   - id: string (cliq ID)
 *
 * Returns:
 *   - 200 OK with cliq summary info
 *   - 401 if unauthenticated or missing cliq ID
 *   - 403 if user is not a member of the cliq
 *   - 404 if cliq does not exist
 *   - 500 on server error
 */

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
        coverImage: true,
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
