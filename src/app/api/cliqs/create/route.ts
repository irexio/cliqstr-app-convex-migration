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
import { convexHttp } from '@/lib/convex-server';
import { api } from '../../../../convex/_generated/api';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';
import { isValidPlan } from '@/lib/utils/planUtils';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  privacy: z.enum(['private', 'semi', 'public']),
  coverImage: z.string().url().optional().or(z.literal('')),
  minAge: z.number().int().min(1).max(100).optional().nullable(),
  maxAge: z.number().int().min(1).max(100).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has a profile
    if (!user.myProfile) {
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

    const { name, description, privacy, coverImage, minAge, maxAge } = parsed.data;

    // 🔒 CRITICAL: Check child permissions for public cliq creation
    if (user.account?.role === 'Child' && (privacy === 'public' || privacy === 'semi_private')) {
      // Get child settings to check parental permissions
      const childSettings = await convexHttp.query(api.users.getChildSettings, {
        profileId: user.myProfile._id as any,
      });
      
      if (!childSettings?.canCreatePublicCliqs) {
        console.log(`[APA] Child blocked from creating ${privacy} cliq:`, user.email);
        return NextResponse.json({
          error: 'You need parent permission to create public or semi-private cliqs'
        }, { status: 403 });
      }
    }

    // Validate age range if both are provided
    if (minAge && maxAge && minAge >= maxAge) {
      return NextResponse.json({ 
        error: 'Minimum age must be less than maximum age' 
      }, { status: 400 });
    }


    const DEFAULT_IMAGE = '/images/default-gradient.png';
    const finalCoverImage =
      coverImage && coverImage.length > 0 ? coverImage : DEFAULT_IMAGE;

    let finalPrivacy: 'private' | 'public' | 'semi_private' = privacy as any;
    if (privacy === 'semi') {
      finalPrivacy = 'semi_private';
    }

    const cliqId = await convexHttp.mutation(api.cliqs.createCliq, {
      name,
      description,
      privacy: finalPrivacy,
      coverImage: finalCoverImage,
      minAge: minAge || undefined,
      maxAge: maxAge || undefined,
      creatorId: user.id as any,
    });

    console.log(`[CREATE_CLIQ_SUCCESS] Created cliq ${cliqId} for user ${user.id}`);
    return NextResponse.json({ 
      cliqId,
      success: true,
      message: 'Cliq created successfully'
    });
  } catch (error) {
    console.error('[CREATE_CLIQ_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
