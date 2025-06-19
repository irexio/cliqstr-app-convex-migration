import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Post content required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content,
        authorId: user.id,
        cliqId: '', // Add the cliqId if needed for context
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('[CHOOSE_PLAN_POST_CREATE]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
