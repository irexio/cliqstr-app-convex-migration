// Script to create an admin user in the database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Admin user details - you can modify these as needed
    const adminEmail = 'admin@cliqstr.com';
    const adminPassword = 'Admin123!'; // You should change this after creation
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        isApproved: true,
      }
    });
    
    // Create admin profile
    const adminProfile = await prisma.profile.create({
      data: {
        userId: adminUser.id,
        username: 'admin',
        birthdate: new Date('1990-01-01'), // Placeholder birthdate
        ageGroup: 'adult',
      }
    });
    
    // Create admin account with Admin role
    const adminAccount = await prisma.account.create({
      data: {
        userId: adminUser.id,
        role: 'Admin',
        isApproved: true,
        plan: 'admin',
        stripeStatus: 'active',
      }
    });
    
    console.log('✅ Admin user created successfully:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`User ID: ${adminUser.id}`);
    console.log('IMPORTANT: Please change the password after first login');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
