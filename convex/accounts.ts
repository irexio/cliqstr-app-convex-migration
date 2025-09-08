import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create account
export const createAccount = mutation({
  args: {
    userId: v.id("users"),
    birthdate: v.number(),
    role: v.string(),
    isApproved: v.boolean(),
    stripeStatus: v.optional(v.string()),
    plan: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    suspended: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const accountId = await ctx.db.insert("accounts", {
      userId: args.userId,
      birthdate: args.birthdate,
      role: args.role,
      isApproved: args.isApproved,
      stripeStatus: args.stripeStatus,
      plan: args.plan,
      stripeCustomerId: args.stripeCustomerId,
      createdAt: now,
      suspended: args.suspended,
    });

    return accountId;
  },
});

// Get account by user ID
export const getAccountByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});
