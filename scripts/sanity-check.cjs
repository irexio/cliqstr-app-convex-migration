// scripts/sanity-check.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async function run() {
  console.log('Running sanity check…');

  const users = await prisma.user.count();
  const profiles = await prisma.myProfile.count();

  const usersWithoutProfile = await prisma.user.count({
    where: { myProfile: { is: null } },
  });
  // MyProfile.user relation is required in schema, so Prisma relation-null filters are invalid.
  // Use a raw orphan check to be safe (should normally be 0 due to FK constraint).
  const orphanRows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::bigint AS c
     FROM "MyProfile" p
     LEFT JOIN "User" u ON u.id = p."userId"
     WHERE u.id IS NULL`
  );
  const profilesWithoutUser = Array.isArray(orphanRows) && orphanRows[0] && orphanRows[0].c ? Number(orphanRows[0].c) : 0;

  const dupEmails = await prisma.$queryRawUnsafe(`
    SELECT email, COUNT(*)::bigint AS c
    FROM "User"
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  `);

  const dupUsernames = await prisma.$queryRawUnsafe(`
    SELECT username, COUNT(*)::bigint AS c
    FROM "MyProfile"
    WHERE username IS NOT NULL
    GROUP BY username
    HAVING COUNT(*) > 1
  `);

  console.log({
    users,
    profiles,
    usersWithoutProfile,
    profilesWithoutUser,
    dupEmailsCount: dupEmails.length,
    dupUsernamesCount: dupUsernames.length,
    sampleDupEmails: dupEmails.slice(0, 5),
    sampleDupUsernames: dupUsernames.slice(0, 5),
  });
})()
  .catch((e) => { console.error('❌ sanity-check failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
