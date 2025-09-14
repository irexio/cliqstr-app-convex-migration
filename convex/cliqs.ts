import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get cliq by ID with membership check
export const getCliq = query({
  args: { 
    cliqId: v.id("cliqs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user is a member of this cliq
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_cliq", (q) => 
        q.eq("userId", args.userId).eq("cliqId", args.cliqId)
      )
      .first();

    if (!membership) {
      throw new Error("Not authorized to access this cliq");
    }

    const cliq = await ctx.db.get(args.cliqId);
    if (!cliq) {
      throw new Error("Cliq not found");
    }

    return {
      id: cliq._id,
      name: cliq.name,
      description: cliq.description,
      privacy: cliq.privacy,
      createdAt: cliq.createdAt,
      ownerId: cliq.ownerId,
      coverImage: cliq.coverImage,
    };
  },
});

// Get cliqs owned by user
export const getOwnedCliqs = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cliqs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", args.ownerId))
      .filter((q) => q.eq(q.field("deleted"), false))
      .collect();
  },
});

// Get cliqs where user is a member
export const getUserCliqs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    console.log('getUserCliqs called for userId:', args.userId);
    
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    console.log('Found memberships:', memberships.length, memberships);

    const cliqs = await Promise.all(
      memberships.map(async (membership) => {
        const cliq = await ctx.db.get(membership.cliqId);
        console.log('Membership cliq:', membership.cliqId, 'found:', !!cliq, cliq?.name);
        return cliq ? { ...cliq, membership } : null;
      })
    );

    const filteredCliqs = cliqs.filter((cliq) => cliq && !cliq.deleted);
    console.log('Final cliqs returned:', filteredCliqs.length, filteredCliqs.map(c => c?.name));
    
    return filteredCliqs;
  },
});

// Create new cliq
export const createCliq = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    privacy: v.union(v.literal("private"), v.literal("public"), v.literal("semi_private")),
    coverImage: v.optional(v.string()),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    creatorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const cliqId = await ctx.db.insert("cliqs", {
      name: args.name,
      description: args.description || "",
      ownerId: args.creatorId,
      createdAt: now,
      deleted: false,
      privacy: args.privacy,
      coverImage: args.coverImage || "/images/default-gradient.png",
      minAge: args.minAge,
      maxAge: args.maxAge,
    });

    // Automatically add creator as a member
    await ctx.db.insert("memberships", {
      userId: args.creatorId,
      cliqId,
      role: "admin",
      joinedAt: now,
    });

    return cliqId;
  },
});

// Get cliq with basic info (optimized - no heavy includes)
export const getCliqBasic = query({
  args: { cliqId: v.id("cliqs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.cliqId);
  },
});

// Update cliq (owner only)
export const updateCliq = mutation({
  args: {
    cliqId: v.id("cliqs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    privacy: v.optional(v.union(v.literal("private"), v.literal("public"), v.literal("semi_private"))),
    coverImage: v.optional(v.string()),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cliq = await ctx.db.get(args.cliqId);
    if (!cliq) throw new Error("Cliq not found");
    
    await ctx.db.patch(args.cliqId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.privacy && { privacy: args.privacy }),
      ...(args.coverImage !== undefined && { coverImage: args.coverImage }),
      ...(args.minAge !== undefined && { minAge: args.minAge }),
      ...(args.maxAge !== undefined && { maxAge: args.maxAge }),
    });
    
    return args.cliqId;
  },
});

// Soft delete cliq (owner only)
export const deleteCliq = mutation({
  args: { cliqId: v.id("cliqs") },
  handler: async (ctx, args) => {
    const cliq = await ctx.db.get(args.cliqId);
    if (!cliq) throw new Error("Cliq not found");
    
    await ctx.db.patch(args.cliqId, {
      deleted: true,
      deletedAt: Date.now(),
    });
    
    return args.cliqId;
  },
});


// Check if user is member of cliq
export const isCliqMember = query({
  args: {
    userId: v.id("users"),
    cliqId: v.id("cliqs"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_cliq", (q) => 
        q.eq("userId", args.userId).eq("cliqId", args.cliqId)
      )
      .first();

    return !!membership;
  },
});

// Get cliq members
export const getCliqMembers = query({
  args: { cliqId: v.id("cliqs") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_cliq_id", (q) => q.eq("cliqId", args.cliqId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        const profile = await ctx.db
          .query("myProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", membership.userId))
          .first();

        return user ? {
          id: user._id,
          email: user.email,
          role: membership.role,
          joinedAt: membership.joinedAt,
          profile: profile ? {
            username: profile.username,
            firstName: profile.firstName,
            lastName: profile.lastName,
            image: profile.image,
          } : null,
        } : null;
      })
    );

    return members.filter(Boolean);
  },
});

// Get all cliqs (for validation)
export const getAllCliqs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cliqs").collect();
  },
});

