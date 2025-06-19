import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get('childId');

  if (!childId) {
    return NextResponse.json({ error: 'Missing childId' }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: childId },
      select: {
        birthdate: true, // Removed .name to avoid schema conflict
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('Error fetching child info:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
