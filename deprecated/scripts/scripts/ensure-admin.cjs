// scripts/ensure-admin.cjs
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@cliqstr.com';
  const username = process.env.ADMIN_USERNAME || 'adminroot';
  const password = process.env.ADMIN_PASSWORD || 'test1234';
  const birthdate = new Date('1990-01-01');

  console.log('Seeding admin…', { email, username });

  const passwordHash = await bcrypt.hash(password, 12);

  // 1) User
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

  // 2) Account
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

  // 3) MyProfile
  await prisma.myProfile.upsert({
    where: { userId: user.id },
    update: { username, birthdate },
    create: { userId: user.id, username, birthdate },
  });

  console.log('✅ Admin ready', { id: user.id, email, username });
})()
  .catch((e) => { console.error('❌ ensure-admin failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
