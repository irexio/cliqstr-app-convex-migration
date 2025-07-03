/**
 * 🔐 APA-HARDENED ROUTE: POST /api/posts/create
 *
 * Purpose:
 *   - Creates a new post inside a specific cliq
 *   - Supports optional image and text content
 *   - Sets default expiration at 90 days
 *
 * Auth:
 *   - Uses getCurrentUser() for session validation
 *
 * Input Body:
 *   {
 *     content?: string,
 *     image?: string (URL),
 *     cliqId: string
 *   }
 *
 * Returns:
 *   - 200 OK + new post
 *   - 401 if unauthenticated
 *   - 400 if invalid input or missing content
 *   - 500 on DB/server error
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';

const schema = z.object({
  content: z.string().optional(),
  image: z.string().url().optional(),
  cliqId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new NextResponse('Invalid input', { status: 400 });
  }

  const { content, image, cliqId } = result.data;

  if (!content && !image) {
    return new NextResponse('Post must include content or an image.', { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  try {
    const post = await prisma.post.create({
      data: {
        content: content || '',
        image: image || null,
        cliqId,
        authorId: user.id,
        expiresAt,
      },
    });

    return NextResponse.json(post);
  } catch (err) {
    console.error('❌ Post creation error:', err);
    return new NextResponse('Server error', { status: 500 });
  }
}
