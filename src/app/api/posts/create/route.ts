// 🔐 APA-HARDENED — Create new post in specified cliq
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth/getServerSession';
import { z } from 'zod';

const postSchema = z.object({
  content: z.string().min(1),
  cliqId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { content, cliqId } = parsed.data;

    const newPost = await prisma.post.create({
      data: {
        content,
        cliqId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ post: newPost });
  } catch (error) {
    console.error('❌ Error creating post:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
