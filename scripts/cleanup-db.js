// Database Cleanup Script
// This script removes all users except the admin@cliqstr.com admin user

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Admin email to preserve
const ADMIN_EMAIL = 'admin@cliqstr.com';

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');
    console.log(`Will preserve only the admin user: ${ADMIN_EMAIL}`);
    
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: {
        email: ADMIN_EMAIL
      }
    });
    
    if (!adminUser) {
      console.log('Admin user not found. Aborting cleanup to prevent data loss.');
      return;
    }
    
    const adminId = adminUser.id;
    console.log(`Found admin user with ID: ${adminId}`);

    
    console.log('
Deleting non-admin data...');
    
    // Clean up data in order of dependencies
    
    // First, delete replies
    await prisma.reply.deleteMany({
      where: {
        authorId: {
          not: adminId
        }
      }
    });
    console.log('✓ Replies removed');
    
    // Delete posts
    await prisma.post.deleteMany({
      where: {
        authorId: {
          not: adminId
        }
      }
    });
    console.log('✓ Posts removed');
    
    // Delete invite requests
    await prisma.inviteRequest.deleteMany({
      where: {
        inviterId: {
          not: adminId
        }
      }
    });
    console.log('✓ Invite requests removed');
    
    // Delete invites
    await prisma.invite.deleteMany({
      where: {
        inviterId: {
          not: adminId
        }
      }
    });
    console.log('✓ Invites removed');
    
    // Delete memberships
    await prisma.membership.deleteMany({
      where: {
        userId: {
          not: adminId
        }
      }
    });
    console.log('✓ Memberships removed');
    
    // Delete parent links
    await prisma.parentLink.deleteMany({
      where: {
        child: {
          userId: {
            not: adminId
          }
        }
      }
    });
    console.log('✓ Parent links removed');
    
    // Delete profiles
    await prisma.profile.deleteMany({
      where: {
        userId: {
          not: adminId
        }
      }
    });
    console.log('✓ Profiles removed');
    
    // Delete Cliqs owned by non-admin users
    await prisma.cliq.deleteMany({
      where: {
        ownerId: {
          not: adminId
        }
      }
    });
    console.log('✓ Cliqs owned by non-admins removed');
    
    // Finally, delete users
    const result = await prisma.user.deleteMany({
      where: {
        id: {
          not: adminId
        }
      }
    });
    
    console.log(`✓ ${result.count} non-admin users removed`);
    console.log('\nDatabase cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase();
