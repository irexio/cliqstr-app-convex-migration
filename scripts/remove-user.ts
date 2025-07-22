import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

async function removeUser(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find the user first to confirm they exist
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        account: true,
      },
    });
    
    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }
    
    console.log(`✅ Found user: ${user.id}`);
    console.log(`📊 User details:`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Is Approved: ${user.account?.isApproved ?? 'No account'}`);
    console.log(`- Role: ${user.account?.role ?? 'No account'}`);
    console.log(`- Created At: ${user.createdAt}`);
    
    // Ask for confirmation
    console.log('\n⚠️ Are you sure you want to delete this user? (y/n)');
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    readline.question('', async (answer: string) => {
      if (answer.toLowerCase() === 'y') {
        // Delete related records first to avoid foreign key constraints
        if (user.profile) {
          await prisma.profile.delete({
            where: { userId: user.id },
          });
          console.log(`✅ Deleted profile for user: ${user.id}`);
        }
        
        if (user.account) {
          await prisma.account.delete({
            where: { userId: user.id },
          });
          console.log(`✅ Deleted account for user: ${user.id}`);
        }
        
        // Delete the user
        await prisma.user.delete({
          where: { id: user.id },
        });
        
        console.log(`✅ Successfully deleted user: ${email}`);
      } else {
        console.log('❌ Operation cancelled');
      }
      
      readline.close();
      await prisma.$disconnect();
    });
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Example: npx ts-node scripts/remove-user.ts user@example.com');
  process.exit(1);
}

removeUser(email);
