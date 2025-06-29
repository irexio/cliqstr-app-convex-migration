// 🔐 APA-HARDENED — Updates parent-controlled child settings
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';

const schema = z.object({
  childId: z.string().min(1),
  settings: z.object({
    canSendInvites: z.boolean().optional(),
    canCreatePublicCliqs: z.boolean().optional(),
    canAccessGames: z.boolean().optional(),
    canPostImages: z.boolean().optional(),
    canShareYouTube: z.boolean().optional(),
    visibilityLevel: z.enum(['summary', 'flagged', 'full']).optional(),
  }),
});

export async function POST(req: Request) {
  try {
    const parent = await getCurrentUser();
    if (!parent?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { childId, settings } = parsed.data;

    // 🔒 Ensure parent is linked to child
    const link = await prisma.parentLink.findFirst({
      where: {
        childId,
        email: parent.email,
      },
    });

    if (!link) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ✅ Update child profile with parent settings
    await prisma.profile.update({
      where: { id: childId },
      data: { ...settings },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Parent settings update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
