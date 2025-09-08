import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create cliq notice
export const createNotice = mutation({
  args: {
    cliqId: v.id("cliqs"),
    type: v.string(),
    content: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const noticeId = await ctx.db.insert("cliqNotices", {
      cliqId: args.cliqId,
      type: args.type,
      content: args.content,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });

    return noticeId;
  },
});
