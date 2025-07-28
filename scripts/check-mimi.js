const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMimi() {
  try {
    const profile = await prisma.myProfile.findFirst({ 
      where: { username: 'mimi' } 
    });
    
    console.log('Mimi profile details:');
    console.log(JSON.stringify(profile, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMimi();
