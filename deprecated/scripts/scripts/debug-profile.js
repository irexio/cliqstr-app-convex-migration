// Debug script to check profile setup
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProfile() {
  try {
    console.log('🔍 Debugging profile setup...\n');

    // Check all users
    const users = await prisma.user.findMany({
      include: {
        myProfile: true,
        account: true,
      },
    });

    console.log(`📊 Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  First Name: ${user.firstName}`);
      console.log(`  Has Profile: ${user.myProfile ? '✅ Yes' : '❌ No'}`);
      
      if (user.myProfile) {
        console.log(`  Profile ID: ${user.myProfile.id}`);
        console.log(`  Username: ${user.myProfile.username}`);
        console.log(`  Avatar: ${user.myProfile.image || 'None'}`);
        console.log(`  Banner: ${user.myProfile.bannerImage || 'None'}`);
      }
      
      console.log(`  Account Status: ${user.account?.isApproved ? '✅ Approved' : '❌ Not Approved'}`);
      console.log('---');
    });

    // Check UploadThing related data
    console.log('\n📁 Checking for any uploaded files in profiles...');
    const profilesWithImages = await prisma.myProfile.findMany({
      where: {
        OR: [
          { image: { not: null } },
          { bannerImage: { not: null } }
        ]
      }
    });

    console.log(`Found ${profilesWithImages.length} profiles with images:`);
    profilesWithImages.forEach(profile => {
      console.log(`  ${profile.username}: avatar=${profile.image ? '✅' : '❌'}, banner=${profile.bannerImage ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProfile();
