import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get profile by username
export const getProfileByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("myProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!profile) return null;

    const user = await ctx.db.get(profile.userId);
    return {
      ...profile,
      user: user ? {
        id: user._id,
        email: user.email,
      } : null,
    };
  },
});

// Get profile by user ID
export const getProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("myProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Create profile
export const createProfile = mutation({
  args: {
    userId: v.id("users"),
    username: v.string(),
    birthdate: v.number(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    about: v.optional(v.string()),
    image: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    showYear: v.optional(v.boolean()),
    aiModerationLevel: v.optional(v.union(v.literal("strict"), v.literal("moderate"), v.literal("relaxed"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const profileId = await ctx.db.insert("myProfiles", {
      username: args.username,
      birthdate: args.birthdate,
      createdAt: now,
      updatedAt: now,
      userId: args.userId,
      firstName: args.firstName,
      lastName: args.lastName,
      about: args.about,
      image: args.image,
      bannerImage: args.bannerImage,
      showYear: args.showYear ?? false,
      aiModerationLevel: args.aiModerationLevel ?? "strict",
    });

    return profileId;
  },
});

// Update profile
export const updateProfile = mutation({
  args: {
    profileId: v.id("myProfiles"),
    updates: v.object({
      username: v.optional(v.string()),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      about: v.optional(v.string()),
      image: v.optional(v.string()),
      bannerImage: v.optional(v.string()),
      showYear: v.optional(v.boolean()),
      aiModerationLevel: v.optional(v.union(v.literal("strict"), v.literal("moderate"), v.literal("relaxed"))),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Get all profiles (for debugging)
export const getAllProfiles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("myProfiles").collect();
  },
});

// Delete profile
export const deleteProfile = mutation({
  args: { profileId: v.id("myProfiles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.profileId);
  },
});

// Check if users share any cliqs
export const checkSharedCliqMembership = query({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all cliqs for user1
    const user1Memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId1))
      .collect();

    const user1CliqIds = user1Memberships.map(m => m.cliqId);

    // Check if user2 is a member of any of user1's cliqs
    for (const cliqId of user1CliqIds) {
      const user2Membership = await ctx.db
        .query("memberships")
        .withIndex("by_user_cliq", (q) => 
          q.eq("userId", args.userId2).eq("cliqId", cliqId)
        )
        .first();

      if (user2Membership) {
        return true; // They share at least one cliq
      }
    }

    return false; // No shared cliqs
  },
});
