export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get('childId');
  if (!childId) {
    return NextResponse.json({ error: 'Missing childId' }, { status: 400 });
  }
  // Look up Profile by userId (childId)
  const profile = await prisma.myProfile.findUnique({
    where: { userId: childId },
  });
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  // Fetch ChildSettings by profileId
  const childSettings = await prisma.childSettings.findUnique({
    where: { profileId: profile.id },
  });
  if (!childSettings) {
    return NextResponse.json({});
  }
  return NextResponse.json(childSettings);
}
