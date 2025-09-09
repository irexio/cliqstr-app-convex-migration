const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentUploads() {
  try {
    console.log('🔍 Checking for recent avatar uploads...\n');

    // Check all profiles with images
    const profilesWithImages = await prisma.myProfile.findMany({
      where: {
        image: { not: null }
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`📊 Found ${profilesWithImages.length} profiles with avatar images:\n`);

    profilesWithImages.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.username}:`);
      console.log(`   Avatar: ${profile.image}`);
      console.log(`   Updated: ${profile.updatedAt}`);
      console.log('---');
    });

    // Also check for any profiles with empty string images
    const profilesWithEmptyImages = await prisma.myProfile.findMany({
      where: {
        image: ""
      }
    });

    if (profilesWithEmptyImages.length > 0) {
      console.log(`\n⚠️  Found ${profilesWithEmptyImages.length} profiles with empty string images:`);
      profilesWithEmptyImages.forEach(p => {
        console.log(`- ${p.username}: "${p.image}"`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentUploads();
