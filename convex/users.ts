import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user with profile and account info
export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const profile = await ctx.db
      .query("myProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (account?.suspended) {
      return null; // Suspended users cannot access
    }

    return {
      id: user._id,
      email: user.email,
      plan: account?.plan ?? null,
      role: account?.role ?? null,
      approved: account?.isApproved ?? null,
      myProfile: profile ? {
        id: profile._id,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        image: profile.image,
        bannerImage: profile.bannerImage,
        about: profile.about,
        birthdate: profile.birthdate,
        showYear: profile.showYear,
      } : null,
      account: account ? {
        role: account.role,
        isApproved: account.isApproved,
        stripeStatus: account.stripeStatus || null,
        plan: account.plan || null,
        stripeCustomerId: account.stripeCustomerId || null,
        suspended: account.suspended,
        birthdate: account.birthdate,
      } : null,
    };
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by email or username (for sign-in)
export const getUserForSignIn = query({
  args: { email: v.optional(v.string()), username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .first();
      
      if (user) {
        const profile = await ctx.db
          .query("myProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", user._id))
          .first();
        
        const account = await ctx.db
          .query("accounts")
          .withIndex("by_user_id", (q) => q.eq("userId", user._id))
          .first();
        
        return {
          ...user,
          myProfile: profile,
          account: account,
        };
      }
    }
    
    if (args.username) {
      const profile = await ctx.db
        .query("myProfiles")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .first();
      
      if (profile) {
        const user = await ctx.db.get(profile.userId);
        const account = await ctx.db
          .query("accounts")
          .withIndex("by_user_id", (q) => q.eq("userId", profile.userId))
          .first();
        
        return user ? {
          ...user,
          myProfile: profile,
          account: account,
        } : null;
      }
    }
    
    return null;
  },
});

// Get child settings for a profile
export const getChildSettings = query({
  args: { profileId: v.id("myProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("childSettings")
      .withIndex("by_profile_id", (q) => q.eq("profileId", args.profileId))
      .first();
  },
});

// Verify user email
export const verifyUserEmail = mutation({
  args: { verificationToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_verification_token", (q) => q.eq("verificationToken", args.verificationToken))
      .filter((q) => q.gt(q.field("verificationExpires"), Date.now()))
      .first();

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    await ctx.db.patch(user._id, {
      isVerified: true,
      verificationToken: undefined,
      verificationExpires: undefined,
    });

    return user._id;
  },
});

// Reset user password
export const resetUserPassword = mutation({
  args: { 
    resetToken: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_reset_token", (q) => q.eq("resetToken", args.resetToken))
      .filter((q) => q.gt(q.field("resetTokenExpires"), Date.now()))
      .first();

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash the new password (this should be done on the client side or in a secure environment)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(args.newPassword, 12);

    await ctx.db.patch(user._id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpires: undefined,
    });

    return user._id;
  },
});

// Update user plan
export const updateUserPlan = mutation({
  args: { 
    userId: v.id("users"),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!account) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(account._id, {
      plan: args.plan,
    });

    return account._id;
  },
});

// Upgrade user to parent
export const upgradeToParent = mutation({
  args: { 
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!account) {
      throw new Error("Account not found");
    }

    if (account.role === "Parent") {
      throw new Error("Already a parent account");
    }

    if (account.role === "Child") {
      throw new Error("Child accounts cannot become parents");
    }

    await ctx.db.patch(account._id, {
      role: "Parent",
      isApproved: true, // Parents are auto-approved
    });

    return account._id;
  },
});

// Mark user as verified (idempotent)
export const markUserVerified = mutation({
  args: { 
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isVerified: true,
    });

    return args.userId;
  },
});

// Create new user
export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    isParent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      createdAt: now,
      updatedAt: now,
      isVerified: false,
      isParent: args.isParent ?? false,
    });

    return userId;
  },
});

// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      email: v.optional(v.string()),
      password: v.optional(v.string()),
      resetToken: v.optional(v.string()),
      resetTokenExpires: v.optional(v.number()),
      verificationToken: v.optional(v.string()),
      verificationExpires: v.optional(v.number()),
      isVerified: v.optional(v.boolean()),
      deletedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Get user by reset token
export const getUserByResetToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_reset_token", (q) => q.eq("resetToken", args.token))
      .first();
  },
});

// Get user by verification token
export const getUserByVerificationToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_verification_token", (q) => q.eq("verificationToken", args.token))
      .first();
  },
});

// Get all users (for validation)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Check if user exists by email
export const userExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return !!user;
  },
});

// Create user with account and profile in transaction
export const createUserWithAccount = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    birthdate: v.number(),
    role: v.string(),
    isApproved: v.boolean(),
    plan: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    verificationToken: v.optional(v.string()),
    verificationExpires: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      createdAt: now,
      updatedAt: now,
      isVerified: args.isVerified ?? false,
      isParent: args.role === 'Parent',
      verificationToken: args.verificationToken,
      verificationExpires: args.verificationExpires,
    });

    // Create account
    await ctx.db.insert("accounts", {
      userId,
      birthdate: args.birthdate,
      role: args.role,
      isApproved: args.isApproved,
      plan: args.plan,
      stripeStatus: undefined,
      stripeCustomerId: undefined,
      suspended: false,
      createdAt: now,
    });

    return userId;
  },
});

// Create child settings for a profile
export const createChildSettings = mutation({
  args: {
    profileId: v.id("myProfiles"),
    canSendInvites: v.optional(v.boolean()),
    inviteRequiresApproval: v.optional(v.boolean()),
    canCreatePublicCliqs: v.optional(v.boolean()),
    canPostImages: v.optional(v.boolean()),
    canJoinPublicCliqs: v.optional(v.boolean()),
    canInviteChildren: v.optional(v.boolean()),
    canInviteAdults: v.optional(v.boolean()),
    isSilentlyMonitored: v.optional(v.boolean()),
    aiModerationLevel: v.optional(v.string()),
    canAccessGames: v.optional(v.boolean()),
    canShareYouTube: v.optional(v.boolean()),
    visibilityLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const settingsId = await ctx.db.insert("childSettings", {
      profileId: args.profileId,
      canCreatePublicCliqs: args.canCreatePublicCliqs ?? false,
      canJoinPublicCliqs: args.canJoinPublicCliqs ?? false,
      canCreateCliqs: false, // 🔒 SECURITY: Children need explicit parent permission to create cliqs
      canSendInvites: args.canSendInvites ?? false,
      canInviteChildren: args.canInviteChildren ?? false,
      canInviteAdults: args.canInviteAdults ?? false,
      isSilentlyMonitored: args.isSilentlyMonitored ?? false,
      aiModerationLevel: args.aiModerationLevel,
      canAccessGames: args.canAccessGames ?? true,
      canPostImages: args.canPostImages ?? true,
      canShareYouTube: args.canShareYouTube ?? false,
      visibilityLevel: args.visibilityLevel,
      inviteRequiresApproval: args.inviteRequiresApproval ?? true,
    });

    return settingsId;
  },
});