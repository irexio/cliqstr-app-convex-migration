// Simple script to delete cliqs via direct database update
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Update all cliqs to set deleted = true
    const result = await prisma.cliq.updateMany({
      data: { deleted: true }
    });
    
    console.log(`Deleted ${result.count} cliqs`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
