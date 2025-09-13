import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import crypto from "crypto";

/**
 * Create a parent approval record for any scenario (direct signup or child invite)
 */
export const createParentApproval = mutation({
  args: {
    childFirstName: v.string(),
    childLastName: v.string(),
    childBirthdate: v.string(),
    parentEmail: v.string(),
    context: v.union(v.literal("direct_signup"), v.literal("child_invite")),
    inviteId: v.optional(v.id("invites")),
    cliqId: v.optional(v.id("cliqs")),
    inviterName: v.optional(v.string()),
    cliqName: v.optional(v.string()),
    parentState: v.union(v.literal("new"), v.literal("existing_parent"), v.literal("existing_adult")),
    existingParentId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Generate verification token (similar to generateVerificationToken)
    const approvalToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (3 * 24 * 60 * 60 * 1000); // 3 days
    
    const approvalId = await ctx.db.insert("parentApprovals", {
      childFirstName: args.childFirstName,
      childLastName: args.childLastName,
      childBirthdate: args.childBirthdate,
      parentEmail: args.parentEmail,
      approvalToken,
      status: "pending",
      context: args.context,
      inviteId: args.inviteId,
      cliqId: args.cliqId,
      inviterName: args.inviterName,
      cliqName: args.cliqName,
      parentState: args.parentState,
      existingParentId: args.existingParentId,
      createdAt: Date.now(),
      expiresAt,
    });

    console.log(`[PARENT-APPROVAL] Created approval ${approvalId} with token: ${approvalToken} for context: ${args.context}`);

    return {
      id: approvalId,
      approvalToken,
      expiresAt,
    };
  },
});

/**
 * Get parent approval by approval token
 */
export const getParentApprovalByToken = query({
  args: {
    approvalToken: v.string(),
  },
  handler: async (ctx, args) => {
    const approval = await ctx.db
      .query("parentApprovals")
      .withIndex("by_approval_token", (q) => q.eq("approvalToken", args.approvalToken))
      .first();

    if (!approval) {
      return null;
    }

    // Check if expired (but don't mark as expired in query - that's a mutation)
    if (Date.now() > approval.expiresAt) {
      return null;
    }

    return approval;
  },
});

/**
 * Mark parent approval as expired (mutation)
 */
export const markParentApprovalExpired = mutation({
  args: {
    approvalId: v.id("parentApprovals"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.approvalId, { status: "expired" });
  },
});

/**
 * Approve parent approval (mark as approved)
 */
export const approveParentApproval = mutation({
  args: {
    approvalToken: v.string(),
  },
  handler: async (ctx, args) => {
    const approval = await ctx.db
      .query("parentApprovals")
      .withIndex("by_approval_token", (q) => q.eq("approvalToken", args.approvalToken))
      .first();

    if (!approval) {
      throw new Error("Parent approval not found");
    }

    if (approval.status !== "pending") {
      throw new Error("Approval is no longer pending");
    }

    if (Date.now() > approval.expiresAt) {
      await ctx.db.patch(approval._id, { status: "expired" });
      throw new Error("Approval has expired");
    }

    // Mark as approved
    await ctx.db.patch(approval._id, { 
      status: "approved",
      approvedAt: Date.now(),
    });

    return approval;
  },
});

/**
 * Decline parent approval (mark as declined)
 */
export const declineParentApproval = mutation({
  args: {
    approvalToken: v.string(),
  },
  handler: async (ctx, args) => {
    const approval = await ctx.db
      .query("parentApprovals")
      .withIndex("by_approval_token", (q) => q.eq("approvalToken", args.approvalToken))
      .first();

    if (!approval) {
      throw new Error("Parent approval not found");
    }

    if (approval.status !== "pending") {
      throw new Error("Approval is no longer pending");
    }

    if (Date.now() > approval.expiresAt) {
      await ctx.db.patch(approval._id, { status: "expired" });
      throw new Error("Approval has expired");
    }

    // Mark as declined
    await ctx.db.patch(approval._id, { 
      status: "declined",
      declinedAt: Date.now(),
    });

    return approval;
  },
});

/**
 * Get parent approvals by parent email
 */
export const getParentApprovalsByParentEmail = query({
  args: {
    parentEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const approvals = await ctx.db
      .query("parentApprovals")
      .withIndex("by_parent_email", (q) => q.eq("parentEmail", args.parentEmail))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Filter out expired ones (but don't mark as expired in query)
    const now = Date.now();
    const validApprovals = approvals.filter(approval => approval.expiresAt > now);

    return validApprovals;
  },
});

/**
 * Mark multiple parent approvals as expired (mutation)
 */
export const markParentApprovalsExpired = mutation({
  args: {
    approvalIds: v.array(v.id("parentApprovals")),
  },
  handler: async (ctx, args) => {
    for (const approvalId of args.approvalIds) {
      await ctx.db.patch(approvalId, { status: "expired" });
    }
  },
});

/**
 * Get parent approval by invite ID (for invite context)
 */
export const getParentApprovalByInviteId = query({
  args: {
    inviteId: v.id("invites"),
  },
  handler: async (ctx, args) => {
    const approval = await ctx.db
      .query("parentApprovals")
      .withIndex("by_invite_id", (q) => q.eq("inviteId", args.inviteId))
      .first();

    return approval;
  },
});
