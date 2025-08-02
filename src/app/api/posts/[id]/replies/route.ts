/**
 * 🔐 APA-HARDENED ROUTE: /api/posts/[id]/replies
 *
 * Purpose:
 *   - GET: Fetch all replies for a post
 *   - POST: Create a new reply to a post
 *
 * Auth:
 *   - Requires user to be a member of the cliq that contains the post
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { requireCliqMembership } from '@/lib/auth/requireCliqMembership';
import { resolveDisplayName } from '@/lib/utils/nameUtils';

export const dynamic = 'force-dynamic';

// GET /api/posts/[id]/replies - Fetch replies for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the post to verify cliq membership
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { cliqId: true }
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Verify user is a member of the cliq
  try {
    await requireCliqMembership(user.id, post.cliqId);
  } catch (error) {
    return NextResponse.json({ error: 'Not authorized to view this post' }, { status: 403 });
  }

  // Fetch replies with author information
  const replies = await prisma.reply.findMany({
    where: { postId },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          myProfile: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Transform replies with resolved display names
  const repliesWithNames = replies.map(reply => ({
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt.toISOString(),
    author: {
      id: reply.author.id,
      name: resolveDisplayName(reply.author),
      image: reply.author.myProfile?.image,
      username: reply.author.myProfile?.username,
    },
  }));

  return NextResponse.json({ replies: repliesWithNames });
}

// POST /api/posts/[id]/replies - Create a new reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { content } = body;

  // Validate content
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
  }

  if (content.length > 1000) {
    return NextResponse.json({ error: 'Reply content too long (max 1000 characters)' }, { status: 400 });
  }

  // Get the post to verify it exists and get cliq info
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { cliqId: true, deleted: true }
  });

  if (!post || post.deleted) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Verify user is a member of the cliq
  try {
    await requireCliqMembership(user.id, post.cliqId);
  } catch (error) {
    return NextResponse.json({ error: 'Not authorized to reply to this post' }, { status: 403 });
  }

  // Create the reply
  const reply = await prisma.reply.create({
    data: {
      content: content.trim(),
      postId,
      authorId: user.id,
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          myProfile: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      },
    },
  });

  // Transform reply with resolved display name
  const replyWithName = {
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt.toISOString(),
    author: {
      id: reply.author.id,
      name: resolveDisplayName(reply.author),
      image: reply.author.myProfile?.image,
      username: reply.author.myProfile?.username,
    },
  };

  return NextResponse.json({ reply: replyWithName }, { status: 201 });
}
