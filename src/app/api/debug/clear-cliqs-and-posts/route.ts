// Debug route to clear all cliqs and posts (for after testing)
import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function POST() {
  try {
    console.log("🧹 Clearing all cliqs and posts...");
    
    const results = {
      deletedCliqs: [] as string[],
      deletedPosts: [] as string[],
      deletedReplies: [] as string[],
      deletedMemberships: [] as string[],
      deletedInvites: [] as string[],
      deletedCliqNotices: [] as string[],
      errors: [] as string[]
    };
    
    // Get all data first
    const [cliqs, posts, replies, memberships, invites, cliqNotices] = await Promise.all([
      convexHttp.query(api.cliqs.getAllCliqs),
      convexHttp.query(api.posts.getAllPosts),
      convexHttp.query(api.replies.getAllReplies),
      convexHttp.query(api.memberships.getAllMemberships),
      convexHttp.query(api.invites.getAllInvites),
      convexHttp.query(api.cliqNotices.getAllCliqNotices)
    ]);
    
    console.log(`Found data: ${cliqs.length} cliqs, ${posts.length} posts, ${replies.length} replies, ${memberships.length} memberships, ${invites.length} invites`);
    
    // Delete in reverse dependency order to avoid foreign key issues
    
    // 1. Delete replies first
    for (const reply of replies) {
      try {
        await convexHttp.mutation(api.replies.deleteReply, { replyId: reply._id });
        results.deletedReplies.push(reply._id);
      } catch (error) {
        results.errors.push(`Failed to delete reply ${reply._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // 2. Delete posts
    for (const post of posts) {
      try {
        await convexHttp.mutation(api.posts.deletePost, { postId: post._id });
        results.deletedPosts.push(post._id);
      } catch (error) {
        results.errors.push(`Failed to delete post ${post._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // 3. Delete cliq notices
    for (const notice of cliqNotices) {
      try {
        await convexHttp.mutation(api.cliqNotices.deleteCliqNotice, { noticeId: notice._id });
        results.deletedCliqNotices.push(notice._id);
      } catch (error) {
        results.errors.push(`Failed to delete cliq notice ${notice._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // 4. Delete memberships
    for (const membership of memberships) {
      try {
        await convexHttp.mutation(api.memberships.deleteMembership, { membershipId: membership._id });
        results.deletedMemberships.push(membership._id);
      } catch (error) {
        results.errors.push(`Failed to delete membership ${membership._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // 5. Delete invites
    for (const invite of invites) {
      try {
        await convexHttp.mutation(api.invites.deleteInvite, { inviteId: invite._id });
        results.deletedInvites.push(invite._id);
      } catch (error) {
        results.errors.push(`Failed to delete invite ${invite._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // 6. Delete cliqs (last)
    for (const cliq of cliqs) {
      try {
        await convexHttp.mutation(api.cliqs.deleteCliq, { cliqId: cliq._id });
        results.deletedCliqs.push(cliq._id);
      } catch (error) {
        results.errors.push(`Failed to delete cliq ${cliq._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log("✅ All cliqs and posts cleared successfully");
    
    return NextResponse.json({
      success: true,
      message: "All cliqs and posts cleared successfully",
      results: {
        summary: {
          cliqs: results.deletedCliqs.length,
          posts: results.deletedPosts.length,
          replies: results.deletedReplies.length,
          memberships: results.deletedMemberships.length,
          invites: results.deletedInvites.length,
          cliqNotices: results.deletedCliqNotices.length,
          errors: results.errors.length
        },
        details: results
      }
    });
    
  } catch (error) {
    console.error("❌ Error during cliqs and posts clear:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
