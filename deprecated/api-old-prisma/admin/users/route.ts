import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export const dynamic = 'force-dynamic';

function requireAdmin(user: any) {
  const role = user?.account?.role || user?.role;
  if (!user?.id || (role !== 'Admin' && role !== 'ADMIN')) {
    return false;
  }
  return true;
}

export async function GET(req: Request) {
  try {
    const admin = await getCurrentUser();
    if (!requireAdmin(admin)) {
      return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const q = searchParams.get('q');
    const take = Number(searchParams.get('take') || 50);
    const skip = Number(searchParams.get('skip') || 0);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const where: any = { deletedAt: includeDeleted ? undefined : null };
    if (role && role !== 'All') {
      where.account = { role };
    }
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { myProfile: { username: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          createdAt: true,
          account: { select: { id: true, role: true, plan: true, isApproved: true, suspended: true } },
          myProfile: { select: { id: true, username: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ ok: true, total, items });
  } catch (err) {
    console.error('[ADMIN][USERS][LIST] error', err);
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 });
  }
}
