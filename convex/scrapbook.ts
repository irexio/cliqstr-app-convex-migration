import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get scrapbook items for a profile
export const getScrapbookItems = query({
  args: { 
    profileId: v.id("myProfiles"),
    includeExpired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    let items = await ctx.db
      .query("scrapbookItems")
      .withIndex("by_profile_id", (q) => q.eq("profileId", args.profileId))
      .collect();

    // Filter out expired items unless they're pinned or includeExpired is true
    if (!args.includeExpired) {
      items = items.filter(item => 
        item.isPinned || item.createdAt >= ninetyDaysAgo
      );
    }

    // Sort by pinned first, then by creation date
    items.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });

    return items;
  },
});

// Add scrapbook item
export const addScrapbookItem = mutation({
  args: {
    profileId: v.id("myProfiles"),
    imageUrl: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const itemId = await ctx.db.insert("scrapbookItems", {
      profileId: args.profileId,
      imageUrl: args.imageUrl,
      caption: args.caption || "",
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });

    return itemId;
  },
});

// Update scrapbook item
export const updateScrapbookItem = mutation({
  args: {
    itemId: v.id("scrapbookItems"),
    updates: v.object({
      caption: v.optional(v.string()),
      isPinned: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete scrapbook item
export const deleteScrapbookItem = mutation({
  args: { itemId: v.id("scrapbookItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});

// Pin/unpin scrapbook item
export const toggleScrapbookItemPin = mutation({
  args: { itemId: v.id("scrapbookItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Scrapbook item not found");
    }

    await ctx.db.patch(args.itemId, {
      isPinned: !item.isPinned,
      updatedAt: Date.now(),
    });
  },
});
