/**
 * 🔐 APA-HARDENED ROUTE: POST /api/cliqs/create
 *
 * Purpose:
 *   - Creates a new cliq for the authenticated user
 *   - Adds the creator to the cliq's membership
 *
 * Auth:
 *   - Requires valid session (user.id)
 *
 * Body:
 *   - name: string
 *   - description?: string
 *   - privacy: 'private' | 'semi' | 'public'
 *   - coverImage?: string (optional; uses default if blank)
 *
 * Returns:
 *   - 200 OK + new cliq
 *   - 401 if unauthorized
 *   - 400 if invalid input
 *   - 500 on error
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';
import { isValidPlan } from '@/lib/utils/planUtils';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  privacy: z.enum(['private', 'semi', 'public']),
  coverImage: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has a profile
    if (!user.profile) {
      console.log('[APA] User missing profile in /api/cliqs/create');
      return NextResponse.json({ error: 'Profile required. Please create your profile first.' }, { status: 403 });
    }
    
    // Simplified plan validation - only check if plan exists
    if (!user.plan) {
      console.log('[APA] User missing plan in /api/cliqs/create');
      return NextResponse.json({ error: 'Missing plan' }, { status: 403 });
    }

    const body = await req.json();

    // Normalize privacy casing and default the coverImage field
    body.privacy = body.privacy?.toLowerCase(); // ensures 'Private' becomes 'private'
    if (!body.coverImage) body.coverImage = '';

    // Validate input
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { name, description, privacy, coverImage } = parsed.data;

    const DEFAULT_IMAGE = '/images/default-gradient.png';
    const finalCoverImage =
      coverImage && coverImage.length > 0 ? coverImage : DEFAULT_IMAGE;

    let finalPrivacy: 'private' | 'public' | 'semi_private' = privacy as any;
    if (privacy === 'semi') {
      finalPrivacy = 'semi_private';
    }

    const cliq = await prisma.cliq.create({
      data: {
        name,
        description,
        privacy: finalPrivacy,
        coverImage: finalCoverImage,
        ownerId: user.id,
        memberships: {
          create: {
            userId: user.id,
            role: 'Owner',
          },
        },
      },
    });

    console.log(`[CREATE_CLIQ_SUCCESS] Created cliq ${cliq.id} for user ${user.id}`);
    return NextResponse.json({ 
      cliq,
      success: true,
      message: 'Cliq created successfully'
    });
  } catch (error) {
    console.error('[CREATE_CLIQ_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
