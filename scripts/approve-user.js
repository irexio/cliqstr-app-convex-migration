// Simple script to approve mimi@cliqstr.com
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveUser() {
  try {
    console.log('Starting user approval process for mimi@cliqstr.com');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'mimi@cliqstr.com' },
      include: { profile: true },
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    console.log('Found user:', user.id, user.email);
    
    if (!user.profile) {
      // Create profile
      console.log('Creating profile...');
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: 'mimi',
          role: 'Adult',
          isApproved: true,
          stripeStatus: 'verified'
        },
      });
      console.log('Created profile:', profile.id);
    } else {
      // Update profile
      console.log('Updating profile...');
      const profile = await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          isApproved: true,
          role: 'Adult',
          stripeStatus: 'verified'
        },
      });
      console.log('Updated profile:', profile.id);
    }

    console.log('User approval complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveUser();
