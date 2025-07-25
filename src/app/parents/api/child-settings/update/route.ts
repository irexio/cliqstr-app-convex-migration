export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(req: Request) {
  try {
    const parent = await getCurrentUser();
    if (!parent?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { childId, ...settings } = body;
    if (!childId) {
      return NextResponse.json({ error: 'Missing childId' }, { status: 400 });
    }
    // Ensure parent is linked to child
    const link = await prisma.parentLink.findFirst({
      where: { childId, email: parent.email },
    });
    if (!link) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Look up Profile by userId (childId)
    const profile = await prisma.myProfile.findUnique({ where: { userId: childId } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    // Fetch or create child settings by profileId
    let childSettings = await prisma.childSettings.findUnique({ where: { profileId: profile.id } });
    if (!childSettings) {
      childSettings = await prisma.childSettings.create({ data: { profileId: profile.id } });
    }
    // Audit log: compare settings
    const auditActions: any[] = [];
    for (const key of Object.keys(settings)) {
      const oldValue = (childSettings as Record<string, any>)[key];
      const newValue = settings[key];
      if (newValue !== undefined && oldValue !== undefined && newValue !== oldValue) {
        auditActions.push({
          parentId: parent.id,
          childId,
          action: `update_${key}`,
          oldValue: String(oldValue),
          newValue: String(newValue),
        });
      }
    }
    if (auditActions.length > 0) {
      await prisma.parentAuditLog.createMany({ data: auditActions });
    }
    // Update child settings
    await prisma.childSettings.update({
      where: { profileId: profile.id },
      data: settings,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Parent child settings update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
