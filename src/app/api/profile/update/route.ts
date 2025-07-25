import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, 
    'Username can only contain letters, numbers, underscores and hyphens'),
  about: z.string().max(500).optional().nullable(),
  image: z.string().url().optional().nullable(),
  bannerImage: z.string().url().optional().nullable(),
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

    const { username, about, image, bannerImage } = parsed.data;

    // Check if username is already taken (excluding current user)
    const existingUsername = await prisma.myProfile.findFirst({
      where: {
        username,
        userId: { not: user.id },
      },
    });

    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    // Update profile
    const updatedProfile = await prisma.myProfile.update({
      where: { userId: user.id },
      data: {
        username,
        about: about || null,
        image: image || null,
        bannerImage: bannerImage || null,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}