export const dynamic = 'force-dynamic';

/**
 * 🚨 DEPRECATED: This route has been rewritten with Convex optimizations
 * 
 * Use: /api/replies/route-convex.ts instead
 * 
 * The new version:
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and enables real-time updates
 * - Client should use useMutation(api.posts.addReply, { ... }) for live updates
 * 
 * @deprecated Use route-convex.ts instead
 */

// 🔐 APA-HARDENED — Create a reply to a post
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { requireCliqMembership } from '@/lib/auth/requireCliqMembership';

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

    // APA-compliant access control: Verify user is a member of this cliq
    try {
      await requireCliqMembership(user.id, post.cliqId);
    } catch (error) {
      return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
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
