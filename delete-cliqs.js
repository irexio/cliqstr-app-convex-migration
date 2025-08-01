const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteCliqs() {
  try {
    console.log('🔍 Finding all cliqs...');
    
    // Find all cliqs
    const cliqs = await prisma.cliq.findMany({
      where: {
        deleted: { not: true } // Only find non-deleted cliqs
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
        privacy: true,
        minAge: true,
        maxAge: true
      }
    });

    console.log(`Found ${cliqs.length} cliqs:`);
    cliqs.forEach((cliq, index) => {
      console.log(`${index + 1}. ${cliq.name} (ID: ${cliq.id})`);
      console.log(`   Privacy: ${cliq.privacy}, Ages: ${cliq.minAge || 'none'}-${cliq.maxAge || 'none'}`);
    });

    if (cliqs.length === 0) {
      console.log('✅ No cliqs to delete!');
      return;
    }

    console.log('\n🗑️ Soft-deleting all cliqs...');
    
    // Soft delete all cliqs (set deleted: true)
    const result = await prisma.cliq.updateMany({
      where: {
        deleted: { not: true }
      },
      data: {
        deleted: true
      }
    });

    console.log(`✅ Successfully soft-deleted ${result.count} cliqs!`);
    console.log('📝 Note: This sets deleted=true, data is preserved for recovery if needed.');
    
  } catch (error) {
    console.error('❌ Error deleting cliqs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteCliqs();
