#!/usr/bin/env tsx

/**
 * Simplified Data Migration Script: Neon PostgreSQL → Convex
 * 
 * This script creates a step-by-step migration process with ID mapping.
 * 
 * Usage:
 * 1. Make sure your original Prisma setup is working
 * 2. Make sure Convex is running (npx convex dev)
 * 3. Run: npx tsx scripts/migrate-data-simple.ts
 */

import { PrismaClient } from '@prisma/client';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Initialize clients
const prisma = new PrismaClient();
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ID mapping to track old Prisma IDs to new Convex IDs
const idMaps = {
  users: new Map<string, string>(),
  cliqs: new Map<string, string>(),
  posts: new Map<string, string>(),
  profiles: new Map<string, string>(),
};

async function migrateUsers() {
  console.log('🔄 Step 1: Migrating users...');
  
  const users = await prisma.user.findMany({
    include: {
      myProfile: true,
      account: true,
    },
  });

  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    try {
      // Create user in Convex
      const convexUserId = await convex.mutation(api.users.createUser, {
        email: user.email,
        password: user.password,
        isParent: user.isParent,
      });

      // Store ID mapping
      idMaps.users.set(user.id, convexUserId);

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

      console.log(`✅ Migrated user: ${user.email} (${user.id} → ${convexUserId})`);
    } catch (error) {
      console.error(`❌ Failed to migrate user ${user.email}:`, error);
    }
  }

  console.log(`✅ Completed user migration: ${idMaps.users.size} users`);
}

async function migrateProfiles() {
  console.log('🔄 Step 2: Migrating profiles...');
  
  const profiles = await prisma.myProfile.findMany();
  console.log(`Found ${profiles.length} profiles to migrate`);

  for (const profile of profiles) {
    try {
      const convexUserId = idMaps.users.get(profile.userId);
      if (!convexUserId) {
        console.warn(`⚠️  No Convex user ID found for profile ${profile.id}`);
        continue;
      }

      const convexProfileId = await convex.mutation(api.profiles.createProfile, {
        userId: convexUserId as any,
        username: profile.username,
        birthdate: profile.birthdate.getTime(),
        firstName: profile.firstName || undefined,
        lastName: profile.lastName || undefined,
        about: profile.about || undefined,
        image: profile.image || undefined,
        bannerImage: profile.bannerImage || undefined,
        showYear: profile.showYear,
        aiModerationLevel: profile.aiModerationLevel,
      });

      idMaps.profiles.set(profile.id, convexProfileId);
      console.log(`✅ Migrated profile: ${profile.username}`);
    } catch (error) {
      console.error(`❌ Failed to migrate profile ${profile.username}:`, error);
    }
  }

  console.log(`✅ Completed profile migration: ${idMaps.profiles.size} profiles`);
}

async function migrateCliqs() {
  console.log('🔄 Step 3: Migrating cliqs...');
  
  const cliqs = await prisma.cliq.findMany();
  console.log(`Found ${cliqs.length} cliqs to migrate`);

  for (const cliq of cliqs) {
    try {
      const convexOwnerId = idMaps.users.get(cliq.ownerId);
      if (!convexOwnerId) {
        console.warn(`⚠️  No Convex user ID found for cliq owner ${cliq.ownerId}`);
        continue;
      }

      const convexCliqId = await convex.mutation(api.cliqs.createCliq, {
        name: cliq.name,
        description: cliq.description || undefined,
        creatorId: convexOwnerId as any,
        privacy: cliq.privacy as any,
        coverImage: cliq.coverImage || undefined,
        minAge: cliq.minAge || undefined,
        maxAge: cliq.maxAge || undefined,
      });

      idMaps.cliqs.set(cliq.id, convexCliqId);
      console.log(`✅ Migrated cliq: ${cliq.name}`);
    } catch (error) {
      console.error(`❌ Failed to migrate cliq ${cliq.name}:`, error);
    }
  }

  console.log(`✅ Completed cliq migration: ${idMaps.cliqs.size} cliqs`);
}

async function migrateMemberships() {
  console.log('🔄 Step 4: Migrating memberships...');
  
  const memberships = await prisma.membership.findMany();
  console.log(`Found ${memberships.length} memberships to migrate`);

  let successCount = 0;
  for (const membership of memberships) {
    try {
      const convexUserId = idMaps.users.get(membership.userId);
      const convexCliqId = idMaps.cliqs.get(membership.cliqId);

      if (!convexUserId || !convexCliqId) {
        console.warn(`⚠️  Missing IDs for membership: user=${membership.userId}, cliq=${membership.cliqId}`);
        continue;
      }

      await convex.mutation(api.memberships.joinCliq, {
        userId: convexUserId as any,
        cliqId: convexCliqId as any,
        role: membership.role,
      });

      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate membership:`, error);
    }
  }

  console.log(`✅ Completed membership migration: ${successCount} memberships`);
}

async function migratePosts() {
  console.log('🔄 Step 5: Migrating posts...');
  
  const posts = await prisma.post.findMany({
    include: {
      replies: true,
    },
  });
  console.log(`Found ${posts.length} posts to migrate`);

  let successCount = 0;
  for (const post of posts) {
    try {
      const convexAuthorId = idMaps.users.get(post.authorId);
      const convexCliqId = idMaps.cliqs.get(post.cliqId);

      if (!convexAuthorId || !convexCliqId) {
        console.warn(`⚠️  Missing IDs for post: author=${post.authorId}, cliq=${post.cliqId}`);
        continue;
      }

      const convexPostId = await convex.mutation(api.posts.createPost, {
        content: post.content,
        image: post.image || undefined,
        authorId: convexAuthorId as any,
        cliqId: convexCliqId as any,
        expiresAt: post.expiresAt?.getTime(),
      });

      idMaps.posts.set(post.id, convexPostId);

      // Migrate replies
      for (const reply of post.replies) {
        const convexReplyAuthorId = idMaps.users.get(reply.authorId);
        if (convexReplyAuthorId) {
          await convex.mutation(api.posts.addReply, {
            content: reply.content,
            postId: convexPostId,
            authorId: convexReplyAuthorId as any,
          });
        }
      }

      successCount++;
      console.log(`✅ Migrated post: ${post.content.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Failed to migrate post:`, error);
    }
  }

  console.log(`✅ Completed post migration: ${successCount} posts`);
}

async function main() {
  console.log('🚀 Starting simplified data migration from Neon to Convex...');
  console.log('⚠️  Make sure Convex is running (npx convex dev)');
  
  try {
    // Test connections
    await prisma.$connect();
    console.log('✅ Connected to Neon database');
    
    // Run migrations in order
    await migrateUsers();
    await migrateProfiles();
    await migrateCliqs();
    await migrateMemberships();
    await migratePosts();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Final Statistics:');
    console.log(`   Users: ${idMaps.users.size}`);
    console.log(`   Profiles: ${idMaps.profiles.size}`);
    console.log(`   Cliqs: ${idMaps.cliqs.size}`);
    console.log(`   Posts: ${idMaps.posts.size}`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Test your Convex app to make sure everything works');
    console.log('   2. Update your environment variables to use Convex');
    console.log('   3. Deploy your Convex app to production');
    console.log('   4. Update your frontend to use the new Convex components');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
main().catch(console.error);
