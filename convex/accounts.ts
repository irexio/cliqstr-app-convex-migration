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

// Get all accounts (for debugging)
export const getAllAccounts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("accounts").collect();
  },
});

// Delete account
export const deleteAccount = mutation({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.accountId);
  },
});

// Update account
export const updateAccount = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      isApproved: v.optional(v.boolean()),
      stripeStatus: v.optional(v.string()),
      plan: v.optional(v.string()),
      stripeCustomerId: v.optional(v.string()),
      suspended: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!account) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(account._id, args.updates);
    return account._id;
  },
});
