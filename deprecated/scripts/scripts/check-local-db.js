// Check local database for good data before migration
const { PrismaClient } = require('@prisma/client');

async function checkLocalDatabase() {
  // Use local DATABASE_URL if available in .env.local, otherwise current
  const localDbUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: localDbUrl
      }
    }
  });
  
  try {
    console.log('🔍 Checking LOCAL database...');
    console.log(`Database URL: ${localDbUrl?.substring(0, 50)}...`);
    console.log('');
    
    // Check for your specific emails
    const testEmails = ['robynpthomas@gmail.com', 'mimi@cliqstr.com', 'admin@cliqstr.com'];
    
    for (const email of testEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          account: true,
          myProfile: true
        }
      });
      
      if (user) {
        console.log(`✅ Found ${email}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Role: ${user.account?.role || 'none'}`);
        console.log(`   Username: ${user.myProfile?.username || 'none'}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Deleted: ${user.deletedAt || 'no'}`);
      } else {
        console.log(`❌ Missing ${email}`);
      }
      console.log('');
    }
    
    // Count total users
    const totalUsers = await prisma.user.count();
    const totalCliqs = await prisma.cliq.count();
    const totalProfiles = await prisma.myProfile.count();
    
    console.log(`📊 Local database summary:`);
    console.log(`   Users: ${totalUsers}`);
    console.log(`   Cliqs: ${totalCliqs}`);
    console.log(`   Profiles: ${totalProfiles}`);
    
  } catch (error) {
    console.error('❌ Error checking local database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocalDatabase();
