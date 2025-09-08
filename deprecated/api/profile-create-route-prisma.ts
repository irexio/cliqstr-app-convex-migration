/**
 * 🚨 DEPRECATED: This route has been rewritten with Convex optimizations
 * 
 * Use: /api/profile/create/route-convex.ts instead
 * 
 * The new version:
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and enables real-time updates
 * - Better performance and scalability
 * 
 * @deprecated Use route-convex.ts instead
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';
import { getAgeGroup } from '@/lib/ageUtils';

const schema = z.object({
  username: z.string().min(3).max(15).regex(/^[a-zA-Z0-9_]+$/),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthdate: z.string().transform((val) => {
    // Parse the date string as local date to avoid timezone issues
    const [year, month, day] = val.split('-').map(Number);
    return new Date(year, month - 1, day);
  }),
  about: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  bannerImage: z.string().url().optional().or(z.literal('')),
  showYear: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a MyProfile
    if (user.myProfile) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: parsed.error.flatten() 
      }, { status: 400 });
    }

    const { username, firstName, lastName, birthdate, about, image, bannerImage, showYear } = parsed.data;

    // Check if username is taken
    const existingProfile = await prisma.myProfile.findUnique({
      where: { username }
    });

    if (existingProfile) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Calculate age group
    const { group } = getAgeGroup(birthdate.toISOString());

    // Create MyProfile
    const profile = await prisma.myProfile.create({
      data: {
        userId: user.id,
        username,
        firstName,
        lastName,
        birthdate,
        showYear,
        ageGroup: group,
        about: about || '',
        image: image || '',
        bannerImage: bannerImage || '',
        aiModerationLevel: group === 'child' ? 'strict' : 'moderate',
      },
    });

    // If child, create default child settings
    if (group === 'child') {
      await prisma.childSettings.create({
        data: {
          profileId: profile.id,
          canSendInvites: false,
          inviteRequiresApproval: true,
          canCreatePublicCliqs: false,
          canPostImages: true, // Allow children to post to their scrapbook
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      profile,
      username: profile.username,
      message: 'Profile created successfully' 
    });
  } catch (error) {
    console.error('[PROFILE_CREATE_ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to create profile' 
    }, { status: 500 });
  }
}
