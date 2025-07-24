/**
 * 🔐 APA-HARDENED ROUTE: POST /api/scrapbook/add
 *
 * Purpose:
 *   - Adds a new item to user's scrapbook/gallery
 *   - Stores uploaded image URL with caption
 *
 * Auth:
 *   - Requires valid session (user.id)
 *   - User must have a profile
 *
 * Body:
 *   - imageUrl: string (from UploadThing)
 *   - caption: string (optional)
 *   - profileId: string
 *
 * Returns:
 *   - 200 OK + scrapbook item
 *   - 401 if unauthorized
 *   - 400 if invalid input
 *   - 500 on error
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';

const schema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().max(280).optional(),
  profileId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: parsed.error.flatten() 
      }, { status: 400 });
    }

    const { imageUrl, caption, profileId } = parsed.data;

    // Verify the profile belongs to the current user
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });

    if (!profile || profile.userId !== user.id) {
      return NextResponse.json({ 
        error: 'You can only add items to your own scrapbook' 
      }, { status: 403 });
    }

    // Create the scrapbook item
    const scrapbookItem = await prisma.scrapbookItem.create({
      data: {
        profileId,
        imageUrl,
        caption: caption || '',
      },
    });

    return NextResponse.json({ 
      success: true, 
      item: scrapbookItem 
    });
  } catch (error) {
    console.error('[SCRAPBOOK_ADD_ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to add scrapbook item' 
    }, { status: 500 });
  }
}