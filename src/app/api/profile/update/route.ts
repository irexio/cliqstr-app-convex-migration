import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, 
    'Username can only contain letters, numbers, underscores and hyphens').optional(),
  about: z.string().max(500).optional().nullable(),
  image: z.string().url().optional().nullable(),
  bannerImage: z.string().url().optional().nullable(),
  showYear: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { username, about, image, bannerImage, showYear } = parsed.data;

    // Check if username is already taken (excluding current user) - only if username is provided
    if (username) {
      const existingUsername = await prisma.myProfile.findFirst({
        where: {
          username,
          userId: { not: user.id },
        },
      });

      if (existingUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (about !== undefined) updateData.about = about || null;
    if (image !== undefined) updateData.image = image || null;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage || null;

    if (showYear !== undefined) updateData.showYear = showYear;

    // Update profile
    const updatedProfile = await prisma.myProfile.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}