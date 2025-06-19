import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ id: null }, { status: 200 });
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    memberships,
  });
}
