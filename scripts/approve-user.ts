// One-time script to approve a specific user
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveUser() {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: 'mimi@cliqstr.com' },
      include: { profile: true, account: true },
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    console.log('Found user:', user.id, user.email);
    
    if (!user.profile) {
      // Create profile if it doesn't exist
      console.log('Creating profile for user...');
      
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: 'mimi',
          role: 'Adult',
          isApproved: true,
          // Add birthdate for APA compliance - using an adult birthdate (30 years old)
          birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
        },
      });
      
      // Create account with subscription data
      const account = await prisma.account.create({
        data: {
          userId: user.id,
          stripeStatus: 'verified',
          plan: 'basic'
        },
      });
      
      console.log('Created profile with ID:', profile.id);
      console.log('Created account with ID:', account.id);
    } else {
      // Update existing profile
      console.log('Updating profile for user...');
      
      const profile = await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          isApproved: true,
          role: 'Adult'
        },
      });
      
      // Update or create account
      let account;
      if (user.account) {
        account = await prisma.account.update({
          where: { id: user.account.id },
          data: {
            stripeStatus: 'verified',
            plan: 'basic'
          },
        });
        console.log('Updated account with ID:', account.id);
      } else {
        account = await prisma.account.create({
          data: {
            userId: user.id,
            stripeStatus: 'verified',
            plan: 'basic'
          },
        });
        console.log('Created new account with ID:', account.id);
      }
      
      console.log('Updated profile with ID:', profile.id);
    }

    console.log('User has been approved!');
  } catch (error) {
    console.error('Error approving user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveUser();
