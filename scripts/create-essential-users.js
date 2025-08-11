// Create essential user accounts in production database
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

async function createEssentialUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creating essential user accounts...\n');
    
    // Users to create
    const users = [
      {
        email: 'robynpthomas@gmail.com',
        password: 'password123', // Change this to your preferred password
        role: 'Adult',
        username: 'robynpthomas'
      },
      {
        email: 'mimi@cliqstr.com',
        password: 'password123', // Change this to your preferred password
        role: 'Adult',
        username: 'mimi'
      }
    ];
    
    for (const userData of users) {
      console.log(`Creating user: ${userData.email}`);
      
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existing) {
        console.log(`  ⚠️  User already exists, skipping`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await hash(userData.password, 10);
      
      // Create user with account and profile
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isVerified: true,
          account: {
            create: {
              role: userData.role,
              isApproved: true,
              birthdate: new Date('1990-01-01'), // Placeholder birthdate
            }
          },
          myProfile: {
            create: {
              username: userData.username,
              birthdate: new Date('1990-01-01'), // Placeholder birthdate
            }
          }
        },
        include: {
          account: true,
          myProfile: true
        }
      });
      
      console.log(`  ✅ Created user ${user.email} with ID: ${user.id}`);
      console.log(`     Role: ${user.account.role}`);
      console.log(`     Username: ${user.myProfile.username}`);
    }
    
    console.log('\n🎉 Essential users created successfully!');
    console.log('\n⚠️  IMPORTANT: Change the default passwords after first login!');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEssentialUsers();
