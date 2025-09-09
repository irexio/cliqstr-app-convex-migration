// Check for user database issues that could affect sign-in
const { PrismaClient } = require('@prisma/client');

async function checkUserIssues() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking for user database issues...\n');
    
    // Check for your specific email
    const yourEmail = 'robynpthomas@gmail.com';
    console.log(`Looking for user with email: ${yourEmail}`);
    
    const yourUser = await prisma.user.findUnique({
      where: { email: yourEmail },
      include: {
        account: true,
        myProfile: true
      }
    });
    
    if (yourUser) {
      console.log('✅ Found your user record:');
      console.log(`- ID: ${yourUser.id}`);
      console.log(`- Email: ${yourUser.email}`);
      console.log(`- Created: ${yourUser.createdAt}`);
      console.log(`- Verified: ${yourUser.isVerified}`);
      console.log(`- VerificationToken: ${yourUser.verificationToken || 'null'}`);
      console.log(`- DeletedAt: ${yourUser.deletedAt || 'null'}`);
      console.log(`- Password hash length: ${yourUser.password?.length || 0}`);
      
      if (yourUser.account) {
        console.log(`- Account Role: ${yourUser.account.role}`);
        console.log(`- Account Approved: ${yourUser.account.isApproved}`);
        console.log(`- Account Suspended: ${yourUser.account.suspended}`);
      } else {
        console.log('- Account: MISSING');
      }
      
      if (yourUser.myProfile) {
        console.log(`- Profile Username: ${yourUser.myProfile.username}`);
      } else {
        console.log('- Profile: MISSING');
      }
    } else {
      console.log('❌ Your user record NOT FOUND!');
    }
    
    console.log('\n🔍 Checking for duplicate emails...');
    const duplicateEmails = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count 
      FROM "User" 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateEmails.length > 0) {
      console.log('❌ Found duplicate emails:');
      duplicateEmails.forEach(row => {
        console.log(`- ${row.email}: ${row.count} records`);
      });
    } else {
      console.log('✅ No duplicate emails found');
    }
    
    console.log('\n🔍 Checking recent user creations...');
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        deletedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${recentUsers.length} users created in last 7 days:`);
    recentUsers.forEach(user => {
      console.log(`- ${user.email} (${user.createdAt}) ${user.deletedAt ? '[DELETED]' : ''}`);
    });
    
    console.log('\n🔍 Checking for users without accounts...');
    const usersWithoutAccounts = await prisma.user.findMany({
      where: {
        account: null
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${usersWithoutAccounts.length} users without Account records:`);
    usersWithoutAccounts.forEach(user => {
      console.log(`- ${user.email} (${user.createdAt})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking user issues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserIssues();
