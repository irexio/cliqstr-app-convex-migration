// POST /api/parent/child/suspend
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(req: Request) {
  try {
    const parent = await getCurrentUser();
    if (!parent?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { childId, action } = await req.json();
    if (!childId) {
      return NextResponse.json({ error: 'Missing childId' }, { status: 400 });
    }
    // Ensure parent is linked to child
    const link = await prisma.parentLink.findFirst({ where: { childId, email: parent.email } });
    if (!link) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Support both suspend and unsuspend
    const suspend = action === 'unsuspend' ? false : true;
    await prisma.account.update({ where: { userId: childId }, data: { suspended: suspend } });
    return NextResponse.json({ success: true, suspended: suspend });
  } catch (err) {
    console.error('Suspend child error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
