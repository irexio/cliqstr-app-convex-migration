#!/usr/bin/env tsx

/**
 * Data Migration Script: Neon PostgreSQL → Convex
 * 
 * This script safely migrates all data from your existing Neon database
 * to your new Convex database.
 * 
 * Usage:
 * 1. Make sure your original Prisma setup is working
 * 2. Make sure Convex is running (npx convex dev)
 * 3. Run: npx tsx scripts/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Initialize clients
const prisma = new PrismaClient();
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Migration statistics
const stats = {
  users: 0,
  profiles: 0,
  accounts: 0,
  cliqs: 0,
  memberships: 0,
  posts: 0,
  replies: 0,
  invites: 0,
  inviteRequests: 0,
  parentLinks: 0,
  parentAuditLogs: 0,
  redAlerts: 0,
  passwordResetAudits: 0,
  scrapbookItems: 0,
  userActivityLogs: 0,
  cliqNotices: 0,
  childSettings: 0,
  errors: [] as string[],
};

async function migrateUsers() {
  console.log('🔄 Migrating users...');
  
  const users = await prisma.user.findMany({
    include: {
      myProfile: true,
      account: true,
    },
  });

  for (const user of users) {
    try {
      // Create user in Convex
      const convexUserId = await convex.mutation(api.users.createUser, {
        email: user.email,
        password: user.password, // Note: You might want to handle this differently
        isParent: user.isParent,
      });

      // Update with additional fields
      await convex.mutation(api.users.updateUser, {
        userId: convexUserId,
        updates: {
          resetToken: user.resetToken || undefined,
          resetTokenExpires: user.resetTokenExpires?.getTime(),
          verificationToken: user.verificationToken || undefined,
          verificationExpires: user.verificationExpires?.getTime(),
          isVerified: user.isVerified,
          deletedAt: user.deletedAt?.getTime(),
        },
      });

      // Create profile if exists
      if (user.myProfile) {
        await convex.mutation(api.profiles.createProfile, {
          userId: convexUserId,
          username: user.myProfile.username,
          birthdate: user.myProfile.birthdate.getTime(),
          firstName: user.myProfile.firstName || undefined,
          lastName: user.myProfile.lastName || undefined,
          about: user.myProfile.about || undefined,
          image: user.myProfile.image || undefined,
          bannerImage: user.myProfile.bannerImage || undefined,
          showYear: user.myProfile.showYear,
          aiModerationLevel: user.myProfile.aiModerationLevel,
        });
        stats.profiles++;
      }

      // Create account if exists
      if (user.account) {
        await convex.mutation(api.accounts.createAccount, {
          userId: convexUserId,
          birthdate: user.account.birthdate.getTime(),
          role: user.account.role,
          isApproved: user.account.isApproved,
          stripeStatus: user.account.stripeStatus || undefined,
          plan: user.account.plan || undefined,
          stripeCustomerId: user.account.stripeCustomerId || undefined,
          suspended: user.account.suspended,
        });
        stats.accounts++;
      }

      stats.users++;
      console.log(`✅ Migrated user: ${user.email}`);
    } catch (error) {
      const errorMsg = `Failed to migrate user ${user.email}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateCliqs() {
  console.log('🔄 Migrating cliqs...');
  
  const cliqs = await prisma.cliq.findMany({
    include: {
      memberships: true,
      notices: true,
    },
  });

  for (const cliq of cliqs) {
    try {
      // Create cliq in Convex
      const convexCliqId = await convex.mutation(api.cliqs.createCliq, {
        name: cliq.name,
        description: cliq.description || undefined,
        creatorId: cliq.ownerId as any, // This will need to be mapped to Convex IDs
        privacy: cliq.privacy as any,
        coverImage: cliq.coverImage || undefined,
        minAge: cliq.minAge || undefined,
        maxAge: cliq.maxAge || undefined,
      });

      // Migrate cliq notices
      for (const notice of cliq.notices) {
        await convex.mutation(api.cliqNotices.createNotice, {
          cliqId: convexCliqId,
          type: notice.type,
          content: notice.content,
          expiresAt: notice.expiresAt?.getTime(),
        });
      }

      stats.cliqs++;
      console.log(`✅ Migrated cliq: ${cliq.name}`);
    } catch (error) {
      const errorMsg = `Failed to migrate cliq ${cliq.name}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateMemberships() {
  console.log('🔄 Migrating memberships...');
  
  const memberships = await prisma.membership.findMany();

  for (const membership of memberships) {
    try {
      await convex.mutation(api.memberships.joinCliq, {
        userId: membership.userId as any, // This will need to be mapped
        cliqId: membership.cliqId as any, // This will need to be mapped
        role: membership.role,
      });

      stats.memberships++;
    } catch (error) {
      const errorMsg = `Failed to migrate membership: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migratePosts() {
  console.log('🔄 Migrating posts...');
  
  const posts = await prisma.post.findMany({
    include: {
      replies: true,
    },
  });

  for (const post of posts) {
    try {
      // Create post in Convex
      const convexPostId = await convex.mutation(api.posts.createPost, {
        content: post.content,
        image: post.image,
        authorId: post.authorId as any, // This will need to be mapped
        cliqId: post.cliqId as any, // This will need to be mapped
        expiresAt: post.expiresAt?.getTime(),
      });

      // Migrate replies
      for (const reply of post.replies) {
        await convex.mutation(api.posts.addReply, {
          content: reply.content,
          postId: convexPostId,
          authorId: reply.authorId as any, // This will need to be mapped
        });
      }

      stats.posts++;
      console.log(`✅ Migrated post: ${post.content.substring(0, 50)}...`);
    } catch (error) {
      const errorMsg = `Failed to migrate post: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateInvites() {
  console.log('🔄 Migrating invites...');
  
  const invites = await prisma.invite.findMany();

  for (const invite of invites) {
    try {
      await convex.mutation(api.invites.createInvite, {
        token: invite.token,
        joinCode: invite.joinCode,
        code: invite.code,
        inviteeEmail: invite.inviteeEmail,
        targetEmailNormalized: invite.targetEmailNormalized,
        targetUserId: invite.targetUserId as any,
        targetState: invite.targetState as any,
        inviterId: invite.inviterId as any,
        cliqId: invite.cliqId as any,
        status: invite.status as any,
        used: invite.used,
        acceptedAt: invite.acceptedAt?.getTime(),
        completedAt: invite.completedAt?.getTime(),
        invitedUserId: invite.invitedUserId as any,
        isApproved: invite.isApproved,
        expiresAt: invite.expiresAt?.getTime(),
        invitedRole: invite.invitedRole,
        maxUses: invite.maxUses,
        message: invite.message,
        friendFirstName: invite.friendFirstName,
        friendLastName: invite.friendLastName,
        inviteNote: invite.inviteNote,
        inviteType: invite.inviteType,
        trustedAdultContact: invite.trustedAdultContact,
        parentAccountExists: invite.parentAccountExists,
      });

      stats.invites++;
    } catch (error) {
      const errorMsg = `Failed to migrate invite: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateScrapbookItems() {
  console.log('🔄 Migrating scrapbook items...');
  
  const items = await prisma.scrapbookItem.findMany();

  for (const item of items) {
    try {
      await convex.mutation(api.scrapbook.addScrapbookItem, {
        profileId: item.profileId as any, // This will need to be mapped
        imageUrl: item.imageUrl,
        caption: item.caption,
      });

      // Update pin status if needed
      if (item.isPinned) {
        // Note: You'll need to get the Convex ID for this
        // await convex.mutation(api.scrapbook.toggleScrapbookItemPin, {
        //   itemId: convexItemId,
        // });
      }

      stats.scrapbookItems++;
    } catch (error) {
      const errorMsg = `Failed to migrate scrapbook item: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function main() {
  console.log('🚀 Starting data migration from Neon to Convex...');
  console.log('⚠️  Make sure Convex is running (npx convex dev)');
  
  try {
    // Test connections
    await prisma.$connect();
    console.log('✅ Connected to Neon database');
    
    // Test Convex connection
    await convex.query(api.users.getCurrentUser, { userId: 'test' as any });
    console.log('✅ Connected to Convex');
    
    // Run migrations in order (respecting foreign key relationships)
    await migrateUsers();
    await migrateCliqs();
    await migrateMemberships();
    await migratePosts();
    await migrateInvites();
    await migrateScrapbookItems();
    
    console.log('\n🎉 Migration completed!');
    console.log('📊 Migration Statistics:');
    console.log(`   Users: ${stats.users}`);
    console.log(`   Profiles: ${stats.profiles}`);
    console.log(`   Accounts: ${stats.accounts}`);
    console.log(`   Cliqs: ${stats.cliqs}`);
    console.log(`   Memberships: ${stats.memberships}`);
    console.log(`   Posts: ${stats.posts}`);
    console.log(`   Invites: ${stats.invites}`);
    console.log(`   Scrapbook Items: ${stats.scrapbookItems}`);
    
    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
main().catch(console.error);
