// One-time script to approve a specific user with enhanced error reporting
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function approveUser() {
  try {
    console.log('Script started - attempting to approve mimi@cliqstr.com');
    console.log('Checking database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Find the user by email
    console.log('Searching for user with email: mimi@cliqstr.com');
    const user = await prisma.user.findUnique({
      where: { email: 'mimi@cliqstr.com' },
      include: { profile: true },
    });

    if (!user) {
      console.error('❌ User not found with email mimi@cliqstr.com');
      return;
    }

    console.log('✅ Found user:', { id: user.id, email: user.email });
    console.log('Current profile status:', user.profile ? 'Exists' : 'Does not exist');
    
    if (user.profile) {
      console.log('Existing profile details:', {
        profileId: user.profile.id,
        username: user.profile.username,
        role: user.profile.role,
        isApproved: user.profile.isApproved,
        stripeStatus: user.profile.stripeStatus
      });
    }
    
    if (!user.profile) {
      // Create profile if it doesn't exist
      console.log('Creating new profile for user...');
      
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: 'mimi',
          role: 'Adult',
          isApproved: true,
          stripeStatus: 'verified',
          // Add birthdate for APA compliance - using an adult birthdate (30 years old)
          birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
        },
      });
      
      console.log('✅ Created profile with ID:', profile.id);
    } else {
      // Update existing profile
      console.log('Updating existing profile...');
      
      const profile = await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          isApproved: true,
          role: 'Adult',
          stripeStatus: 'verified'
        },
      });
      
      console.log('✅ Updated profile with ID:', profile.id);
      console.log('New profile details:', {
        profileId: profile.id,
        username: profile.username,
        role: profile.role,
        isApproved: profile.isApproved,
        stripeStatus: profile.stripeStatus
      });
    }

    console.log('🎉 User has been approved successfully!');
  } catch (error) {
    console.error('❌ Error approving user:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
}

approveUser();
