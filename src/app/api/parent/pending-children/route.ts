// GET /api/parent/pending-children
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const parent = await getCurrentUser();
  if (!parent?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Find children linked to this parent who are not approved
  const links = await prisma.parentLink.findMany({ where: { email: parent.email } });
  const childIds = links.map(l => l.childId);
  // Fetch profiles for all linked children
  const profiles = await prisma.profile.findMany({
    where: { id: { in: childIds } },
    select: { id: true, username: true, userId: true },
  });

  // Fetch accounts for these children and filter by isApproved === false
  const accounts = await prisma.account.findMany({
    where: { userId: { in: profiles.map(p => p.userId) }, isApproved: false },
    select: { userId: true },
  });
  const pendingUserIds = new Set(accounts.map(a => a.userId));
  const pendingChildren = profiles.filter(p => pendingUserIds.has(p.userId));
  return NextResponse.json({ pendingChildren });
}
