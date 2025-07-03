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
 *   - coverImage?: string
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

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  privacy: z.enum(['private', 'semi', 'public']),
  coverImage: z.string().url().optional(),
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
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { name, description, privacy, coverImage } = parsed.data;

    // 🧼 Normalize legacy or form inputs to match Prisma enums
    let finalPrivacy: 'private' | 'public' | 'semi_private' = privacy as any;
    if (privacy === 'semi') {
      finalPrivacy = 'semi_private';
    }

    const cliq = await prisma.cliq.create({
      data: {
        name,
        description,
        privacy: finalPrivacy,
        coverImage,
        ownerId: user.id,
        memberships: {
          create: {
            userId: user.id,
            role: 'Owner', // ✅ Matches Prisma enum
          },
        },
      },
    });

    return NextResponse.json({ cliq });
  } catch (error) {
    console.error('[CREATE_CLIQ_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
