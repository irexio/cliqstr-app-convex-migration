export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: POST /api/replies
 * 
 * This is the rewritten version using Convex patterns:
 * - Creates replies using optimized Convex mutations
 * - More efficient than the original Prisma version
 * - Client can use real-time Convex queries for live updates
 * 
 * The client should use:
 * - useMutation(api.posts.addReply, { ... }) for real-time updates
 * - This API route is kept for backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
// Note: Membership verification is now handled by Convex functions automatically
import { bumpActivityAndInvalidate } from '@/lib/session-activity';

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

    // Confirm the post exists and get cliq info
    const post = await convexHttp.query(api.posts.getPost, {
      postId: postId as any,
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Note: Membership verification is now handled by Convex functions automatically

    // Create reply using Convex
    const replyId = await convexHttp.mutation(api.posts.addReply, {
      content: content.trim(),
      postId: postId as any,
      authorId: user.id as any,
    });

    // Bump session activity and invalidate cache
    await bumpActivityAndInvalidate();

    return NextResponse.json({ 
      reply: { 
        id: replyId, 
        content: content.trim(), 
        postId, 
        authorId: user.id 
      } 
    });
  } catch (error) {
    console.error('❌ Error creating reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
