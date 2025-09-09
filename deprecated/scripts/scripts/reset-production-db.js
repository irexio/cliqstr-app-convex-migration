// Reset production database and create fresh essential users
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

async function resetProductionDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️  Resetting production database...\n');
    
    // Delete all data in dependency order
    console.log('Deleting all existing data...');
    
    await prisma.userActivityLog.deleteMany({});
    await prisma.parentAuditLog.deleteMany({});
    await prisma.redAlert.deleteMany({});
    await prisma.passwordResetAudit.deleteMany({});
    await prisma.scrapbookItem.deleteMany({});
    await prisma.membership.deleteMany({});
    await prisma.reply.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.cliqNotice.deleteMany({});
    await prisma.inviteRequest.deleteMany({});
    await prisma.invite.deleteMany({});
    await prisma.cliq.deleteMany({});
    await prisma.parentLink.deleteMany({});
    await prisma.childSettings.deleteMany({});
    await prisma.myProfile.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ All existing data deleted\n');
    
    // Create fresh essential users
    console.log('🔧 Creating fresh essential users...\n');
    
    const users = [
      {
        email: 'robynpthomas@gmail.com',
        password: 'password123', // Change after first login
        role: 'Adult',
        username: 'robynpthomas'
      },
      {
        email: 'mimi@cliqstr.com',
        password: 'password123', // Change after first login
        role: 'Adult',
        username: 'mimi'
      },
      {
        email: 'admin@cliqstr.com',
        password: 'admin123', // Change after first login
        role: 'Admin',
        username: 'admin'
      }
    ];
    
    for (const userData of users) {
      console.log(`Creating user: ${userData.email}`);
      
      const hashedPassword = await hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isVerified: true,
          account: {
            create: {
              role: userData.role,
              isApproved: true,
              birthdate: new Date('1990-01-01'),
            }
          },
          myProfile: {
            create: {
              username: userData.username,
              birthdate: new Date('1990-01-01'),
            }
          }
        },
        include: {
          account: true,
          myProfile: true
        }
      });
      
      console.log(`  ✅ Created ${user.email} (${user.account.role}) - ID: ${user.id}`);
    }
    
    console.log('\n🎉 Production database reset complete!');
    console.log('\n📋 Login credentials:');
    console.log('   robynpthomas@gmail.com / password123');
    console.log('   mimi@cliqstr.com / password123');
    console.log('   admin@cliqstr.com / admin123');
    console.log('\n⚠️  IMPORTANT: Change all passwords after first login!');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetProductionDatabase();
