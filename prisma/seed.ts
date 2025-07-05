// prisma/seed.ts
import { prisma } from '../src/lib/prisma';

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'admin@cliqstr.com',
      password: 'test1234', // plaintext for dev testing only
      profile: {
        create: {
          username: 'admin',
          birthdate: new Date('1980-01-01'),
          role: 'Parent',
          ageGroup: 'adult',
          isApproved: true,
          about: 'I am the founder of Cliqstr. This is a seeded admin profile.',
          image: null,         // no avatar yet
          bannerImage: null    // no banner yet
        },
      },
      account: {
        create: {
          stripeStatus: 'active',
          plan: 'premium',
          stripeCustomerId: 'seed_customer_id'
        }
      }
    },
  });

  await prisma.cliq.create({
    data: {
      name: 'Founders Circle',
      description: 'Private test cliq seeded by Aiden 🐧',
      ownerId: user.id,
    },
  });

  console.log('🌱 Seed complete: admin user + one cliq');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
