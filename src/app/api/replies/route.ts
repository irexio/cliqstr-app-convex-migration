// 🔐 APA-HARDENED — Create a reply to a post
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, content } = await req.json();

    if (!postId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Confirm the post exists and belongs to a cliq the user has access to
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isMember = await prisma.membership.findFirst({
      where: {
        cliqId: post.cliqId,
        userId: user.id,
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reply = await prisma.reply.create({
      data: {
        content,
        postId,
        authorId: user.id,
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('❌ Error creating reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
