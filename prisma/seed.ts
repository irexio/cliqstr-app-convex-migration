// prisma/seed.ts
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding: creating admin user...');

  let user;
  try {
    user = await prisma.user.create({
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
          },
        },

        account: {
          create: {
            role: 'Parent', // 🟢 fixed casing to match your enum
            isApproved: true,
            stripeStatus: 'active',
            plan: 'premium',
            stripeCustomerId: 'seed_customer_id',
          },
        },
      },
      include: {
        account: true,
      },
    });

    console.log('✅ Admin user created:', user.id);
  } catch (e) {
    console.error('❌ Error creating user:', e);
    if (e instanceof Error && e.message) {
      console.error('Error message:', e.message);
    }
    console.error('Full error object:', JSON.stringify(e, null, 2));
    process.exit(1);
  }

  try {
    await prisma.cliq.create({
      data: {
        name: 'Founders Circle',
        description: 'Private test cliq seeded by Aiden 🐧',
        ownerId: user.id,
      },
    });

    console.log('✅ Cliq created and linked to admin');
  } catch (e) {
    console.error('❌ Error creating cliq:', e);
    process.exit(1);
  }

  console.log('🌱 Seed complete: admin user + one cliq');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  if (e instanceof Error && e.message) {
    console.error('Error message:', e.message);
  }
  console.error('Full error:', e);
  process.exit(1);
});
