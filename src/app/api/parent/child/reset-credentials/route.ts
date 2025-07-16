// POST /api/parent/child/reset-credentials
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const parent = await getCurrentUser();
    if (!parent?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { childId, username, password } = await req.json();
    if (!childId || !username || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Ensure parent is linked to child
    const link = await prisma.parentLink.findFirst({ where: { childId, email: parent.email } });
    if (!link) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const hashedPassword = await hash(password, 10);
    await prisma.profile.update({ where: { id: childId }, data: { username } });
    await prisma.user.update({ where: { id: childId }, data: { password: hashedPassword } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset credentials error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
