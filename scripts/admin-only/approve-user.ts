// One-time script to approve a specific user
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mimi@cliqstr.com' },
      include: { profile: true, account: true },
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    console.log('Found user:', user.id, user.email);

    // ✅ Create or update account
    if (user.account) {
      await prisma.account.update({
        where: { id: user.account.id },
        data: {
          role: 'Parent',
          isApproved: true,
          stripeStatus: 'verified',
          plan: 'basic',
        },
      });
      console.log('Updated account');
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          role: 'Parent',
          isApproved: true,
          stripeStatus: 'verified',
          plan: 'basic',
        },
      });
      console.log('Created account');
    }

    // ✅ Create or update profile (safe fields only)
    if (user.profile) {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          username: user.profile.username || 'mimi',
          birthdate: user.profile.birthdate || new Date('1980-01-01'),
          ageGroup: user.profile.ageGroup || 'adult',
        },
      });
      console.log('Updated profile');
    } else {
      await prisma.profile.create({
        data: {
          userId: user.id,
          username: 'mimi',
          birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
          ageGroup: 'adult',
        },
      });
      console.log('Created profile');
    }

    console.log('🎉 User has been approved!');
  } catch (error) {
    console.error('❌ Error approving user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveUser();
