import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@cliqstr.com';
  const username = process.env.ADMIN_USERNAME || 'adminroot';
  const password = process.env.ADMIN_PASSWORD || 'test1234';

  // Required fields present in your schema
  const birthdate = new Date('1990-01-01');

  const passwordHash = await bcrypt.hash(password, 12);

  // 1) Ensure User (email unique)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      isVerified: true,
      deletedAt: null,
    },
    create: {
      email,
      password: passwordHash,
      isVerified: true,
    },
  });

  // 2) Ensure Account (userId unique, holds role)
  await prisma.account.upsert({
    where: { userId: user.id },
    update: {
      role: 'Admin',
      isApproved: true,
      suspended: false,
      birthdate,
    },
    create: {
      userId: user.id,
      role: 'Admin',
      isApproved: true,
      suspended: false,
      birthdate,
    },
  });

  // 3) Ensure MyProfile (userId unique)
  await prisma.myProfile.upsert({
    where: { userId: user.id },
    update: {
      username,
      birthdate,
    },
    create: {
      userId: user.id,
      username,
      birthdate,
    },
  });

  console.log('✅ Admin ready', { id: user.id, email, username });
}

main()
  .catch((e) => {
    console.error('❌ ensure-admin failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
