// scripts/approve-user-verbose.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function approveUser() {
  try {
    console.log('🛠 Approving user: mimi@cliqstr.com');
    await prisma.$connect();

    const user = await prisma.user.findUnique({
      where: { email: 'mimi@cliqstr.com' },
      include: { profile: true, account: true },
    });

    if (!user) {
      console.error('❌ User not found.');
      return;
    }

    console.log('👤 Found user:', { id: user.id, email: user.email });

    // ✅ Ensure account exists and is updated
    if (user.account) {
      const updatedAccount = await prisma.account.update({
        where: { id: user.account.id },
        data: {
          role: 'Parent',
          isApproved: true,
          plan: 'basic',
          stripeStatus: 'verified',
        },
      });
      console.log('✅ Updated account:', updatedAccount);
    } else {
      const newAccount = await prisma.account.create({
        data: {
          userId: user.id,
          role: 'Parent',
          isApproved: true,
          plan: 'basic',
          stripeStatus: 'verified',
        },
      });
      console.log('✅ Created new account:', newAccount);
    }

    // ✅ Ensure profile exists (only includes valid fields)
    if (user.profile) {
      const updatedProfile = await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          username: user.profile.username || 'mimi',
          birthdate: user.profile.birthdate || new Date('1980-01-01'),
          ageGroup: user.profile.ageGroup || 'adult',
        },
      });
      console.log('✅ Updated profile:', updatedProfile);
    } else {
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: 'mimi',
          birthdate: new Date('1980-01-01'),
          ageGroup: 'adult',
        },
      });
      console.log('✅ Created new profile:', newProfile);
    }

    console.log('🎉 User approved successfully!');
  } catch (error) {
    console.error('❌ Error approving user:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    try {
      await prisma.$disconnect();
      console.log('🔌 Disconnected from database');
    } catch (disconnectError) {
      console.error('❌ Error disconnecting:', disconnectError);
    }
  }
}

approveUser();
