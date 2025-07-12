import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding: checking for existing admin user...');

  const existing = await prisma.user.findUnique({
    where: { email: 'admin@cliqstr.com' },
  });

  if (existing) {
    console.log('⚠️ Seed skipped: admin user already exists.');
    return;
  }

  console.log('Seeding: creating admin user...');

  try {
    // STEP 1: Create the user and profile
    const user = await prisma.user.create({
      data: {
        email: 'admin@cliqstr.com',
        password: 'test1234', // plaintext for dev testing only

        profile: {
          create: {
            username: 'admin',
            birthdate: new Date('1980-01-01'),
            ageGroup: 'adult',
            about: 'I am the founder of Cliqstr. This is a seeded admin profile.',
            image: null,
            bannerImage: null,
            aiModerationLevel: 'strict',
          },
        },
      },
    });

    console.log('✅ Admin user created:', user.id);

    await prisma.account.create({
      data: {
        userId: user.id,
        role: 'Parent',
        isApproved: true,
        stripeStatus: 'active',
        plan: 'premium',
        stripeCustomerId: 'seed_customer_id',
      },
    });
    console.log('✅ Account created for admin user');

    // STEP 2: Create the account and link by userId
    await prisma.account.create({
      data: {
        userId: user.id,
        role: 'Parent',
        isApproved: true,
        stripeStatus: 'active',
        plan: 'premium',
        stripeCustomerId: 'seed_customer_id',
      },
    });

    console.log('✅ Account created for admin user');

    // STEP 3: Create a test cliq
    await prisma.cliq.create({
      data: {
        name: 'Founders Circle',
        description: 'Private test cliq seeded by Aiden 🐧',
        ownerId: user.id,
      },
    });

    console.log('✅ Cliq created and linked to admin');
    console.log('🌱 Seed complete: admin user + account + cliq');
  } catch (e) {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
