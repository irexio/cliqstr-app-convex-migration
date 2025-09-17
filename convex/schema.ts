import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    resetToken: v.optional(v.string()),
    resetTokenExpires: v.optional(v.number()),
    verificationExpires: v.optional(v.number()),
    verificationToken: v.optional(v.string()),
    isVerified: v.boolean(),
    isParent: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_reset_token", ["resetToken"])
    .index("by_verification_token", ["verificationToken"]),

  myProfiles: defineTable({
    username: v.string(),
    createdAt: v.number(),
    userId: v.id("users"),
    ageGroup: v.optional(v.string()),
    about: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    image: v.optional(v.string()),
    updatedAt: v.number(),
    aiModerationLevel: v.union(v.literal("strict"), v.literal("moderate"), v.literal("relaxed")),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    showYear: v.boolean(),
    // Birthday visibility controls (computed from accounts.birthdate)
    showMonthDay: v.boolean(), // Show birthday month/day to cliq members
    birthdayMonthDay: v.optional(v.string()), // Cache: "MM-DD" for performance
  })
    .index("by_username", ["username"])
    .index("by_user_id", ["userId"]),

  childSettings: defineTable({
    profileId: v.id("myProfiles"),
    canCreatePublicCliqs: v.boolean(),
    canJoinPublicCliqs: v.boolean(),
    canCreateCliqs: v.boolean(),
    canSendInvites: v.boolean(),
    canInviteChildren: v.boolean(),
    canInviteAdults: v.boolean(),
    isSilentlyMonitored: v.boolean(),
    aiModerationLevel: v.optional(v.string()),
    canAccessGames: v.boolean(),
    canPostImages: v.boolean(),
    canShareYouTube: v.boolean(),
    visibilityLevel: v.optional(v.string()),
    inviteRequiresApproval: v.boolean(),
  })
    .index("by_profile_id", ["profileId"]),

  accounts: defineTable({
    userId: v.id("users"),
    birthdate: v.number(),
    role: v.string(),
    isApproved: v.boolean(),
    stripeStatus: v.optional(v.string()),
    plan: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
    suspended: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_stripe_customer_id", ["stripeCustomerId"]),

  cliqs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    createdAt: v.number(),
    deleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    privacy: v.union(v.literal("private"), v.literal("semi_private"), v.literal("public")),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
  })
    .index("by_owner_id", ["ownerId"])
    .index("by_privacy", ["privacy"])
    .index("by_created_at", ["createdAt"]),

  cliqNotices: defineTable({
    cliqId: v.id("cliqs"),
    type: v.string(),
    content: v.string(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_cliq_id", ["cliqId"])
    .index("by_expires_at", ["expiresAt"]),

  posts: defineTable({
    content: v.string(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    deleted: v.boolean(),
    authorId: v.id("users"),
    cliqId: v.id("cliqs"),
    expiresAt: v.optional(v.number()),
  })
    .index("by_author_id", ["authorId"])
    .index("by_cliq_id", ["cliqId"])
    .index("by_created_at", ["createdAt"]),

  replies: defineTable({
    content: v.string(),
    createdAt: v.number(),
    postId: v.id("posts"),
    authorId: v.id("users"),
  })
    .index("by_post_id", ["postId"])
    .index("by_author_id", ["authorId"]),

  invites: defineTable({
    token: v.string(),
    joinCode: v.optional(v.string()),
    code: v.optional(v.string()),
    inviteeEmail: v.string(),
    targetEmailNormalized: v.string(),
    targetUserId: v.optional(v.id("users")),
    targetState: v.union(
      v.literal("new"),
      v.literal("existing_parent"),
      v.literal("existing_user_non_parent"),
      v.literal("invalid_child")
    ),
    inviterId: v.id("users"),
    cliqId: v.optional(v.id("cliqs")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("completed"), v.literal("canceled")),
    used: v.boolean(),
    acceptedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    invitedUserId: v.optional(v.id("users")),
    isApproved: v.boolean(),
    expiresAt: v.optional(v.number()),
    invitedRole: v.optional(v.string()),
    maxUses: v.optional(v.number()),
    message: v.optional(v.string()),
    friendFirstName: v.optional(v.string()),
    friendLastName: v.optional(v.string()),
    inviteNote: v.optional(v.string()),
    inviteType: v.optional(v.string()),
    trustedAdultContact: v.optional(v.string()),
    parentAccountExists: v.optional(v.boolean()),
  })
    .index("by_token", ["token"])
    .index("by_join_code", ["joinCode"])
    .index("by_code", ["code"])
    .index("by_target_email", ["targetEmailNormalized"])
    .index("by_status_used", ["status", "used"])
    .index("by_inviter_id", ["inviterId"])
    .index("by_cliq_id", ["cliqId"]),

  inviteRequests: defineTable({
    email: v.string(),
    status: v.string(),
    createdAt: v.number(),
    cliqId: v.id("cliqs"),
    invitedRole: v.string(),
    inviteeEmail: v.string(),
    inviterId: v.id("users"),
  })
    .index("by_cliq_id", ["cliqId"])
    .index("by_inviter_id", ["inviterId"])
    .index("by_status", ["status"]),

  parentLinks: defineTable({
    parentId: v.id("users"),
    email: v.string(),
    childId: v.id("users"),
    type: v.string(),
    inviteContext: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_parent_id", ["parentId"])
    .index("by_child_id", ["childId"])
    .index("by_parent_child", ["parentId", "childId"])
    .index("by_email_child", ["email", "childId"]),

  parentAuditLogs: defineTable({
    parentId: v.id("users"),
    childId: v.id("users"),
    action: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_parent_id", ["parentId"])
    .index("by_child_id", ["childId"])
    .index("by_created_at", ["createdAt"]),

  redAlerts: defineTable({
    cliqId: v.id("cliqs"),
    triggeredById: v.id("users"),
    reason: v.optional(v.string()),
    triggeredAt: v.number(),
  })
    .index("by_cliq_id", ["cliqId"])
    .index("by_triggered_by", ["triggeredById"])
    .index("by_triggered_at", ["triggeredAt"]),

  passwordResetAudits: defineTable({
    email: v.string(),
    ip: v.optional(v.string()),
    event: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_created_at", ["createdAt"]),

  memberships: defineTable({
    userId: v.id("users"),
    cliqId: v.id("cliqs"),
    role: v.string(),
    joinedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_cliq_id", ["cliqId"])
    .index("by_user_cliq", ["userId", "cliqId"]),

  scrapbookItems: defineTable({
    profileId: v.id("myProfiles"),
    imageUrl: v.string(),
    caption: v.string(),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_is_pinned", ["isPinned"])
    .index("by_created_at", ["createdAt"]),

  userActivityLogs: defineTable({
    userId: v.optional(v.id("users")),
    event: v.string(),
    detail: v.optional(v.string()),
    debugId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_event", ["event"])
    .index("by_created_at", ["createdAt"]),

  parentApprovals: defineTable({
    // Core child data
    childFirstName: v.string(),
    childLastName: v.string(),
    childBirthdate: v.string(),
    parentEmail: v.string(),
    
    // Approval tracking
    approvalToken: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("declined"), v.literal("expired")),
    
    // Context (what triggered this approval)
    context: v.union(v.literal("direct_signup"), v.literal("child_invite")),
    inviteId: v.optional(v.id("invites")), // If from invite
    cliqId: v.optional(v.id("cliqs")), // If joining specific cliq
    inviterName: v.optional(v.string()), // Name of person who invited child
    cliqName: v.optional(v.string()), // Name of cliq child is being invited to
    
    // Parent state detection
    parentState: v.union(v.literal("new"), v.literal("existing_parent"), v.literal("existing_adult")),
    existingParentId: v.optional(v.id("users")),
    
    // Timestamps
    createdAt: v.number(),
    expiresAt: v.number(),
    approvedAt: v.optional(v.number()),
    declinedAt: v.optional(v.number()),
  })
    .index("by_approval_token", ["approvalToken"])
    .index("by_parent_email", ["parentEmail"])
    .index("by_status", ["status"])
    .index("by_expires_at", ["expiresAt"])
    .index("by_context", ["context"])
    .index("by_invite_id", ["inviteId"]),
});
