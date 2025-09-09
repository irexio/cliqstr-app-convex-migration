// Check for synthetic email conflicts in production DB
const { PrismaClient } = require('@prisma/client');

async function checkSyntheticEmails() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking for synthetic email conflicts...\n');
    
    // Find all users with @child.cliqstr emails
    const syntheticUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@child.cliqstr'
        }
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        deletedAt: true,
        myProfile: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${syntheticUsers.length} synthetic email users:`);
    syntheticUsers.forEach(user => {
      const username = user.email.split('@')[0];
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Username: ${username}`);
      console.log(`  Profile: ${user.myProfile?.username || 'none'}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Deleted: ${user.deletedAt || 'no'}`);
      console.log('');
    });
    
    // Check for potential conflicts with real emails
    const realEmailPrefixes = syntheticUsers.map(u => u.email.split('@')[0]);
    if (realEmailPrefixes.length > 0) {
      console.log('🚨 Checking for potential conflicts with real emails...\n');
      
      const conflictingUsers = await prisma.user.findMany({
        where: {
          AND: [
            {
              email: {
                not: {
                  endsWith: '@child.cliqstr'
                }
              }
            },
            {
              OR: realEmailPrefixes.map(prefix => ({
                email: {
                  startsWith: prefix + '@'
                }
              }))
            }
          ]
        },
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      });
      
      console.log(`Found ${conflictingUsers.length} potentially conflicting real email users:`);
      conflictingUsers.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Created: ${user.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking synthetic emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSyntheticEmails();
