const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Count users
    const userCount = await prisma.user.count();
    console.log('Total users:', userCount);
    
    // Count profiles
    const profileCount = await prisma.myProfile.count();
    console.log('Total myProfiles:', profileCount);
    
    // Get first user if exists
    if (userCount > 0) {
      const firstUser = await prisma.user.findFirst({
        include: {
          myProfile: true,
          account: true
        }
      });
      console.log('\nFirst user:', {
        id: firstUser.id,
        email: firstUser.email,
        hasMyProfile: !!firstUser.myProfile,
        profileUsername: firstUser.myProfile?.username,
        accountRole: firstUser.account?.role,
        accountApproved: firstUser.account?.isApproved
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();