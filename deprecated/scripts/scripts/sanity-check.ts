import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  // Basic counts
  const users = await prisma.user.count();
  const profiles = await prisma.myProfile.count();

  // Relation integrity
  const usersWithoutProfile = await prisma.user.count({
    where: { myProfile: { is: null as any } },
  });
  const profilesWithoutUser = await prisma.myProfile.count({
    where: { user: { is: null as any } },
  });

  // Duplicates (raw SQL against underlying table names)
  const dupEmails = await prisma.$queryRawUnsafe<{ email: string | null; c: bigint }[]>(
    `SELECT email, COUNT(*)::bigint AS c
     FROM "User" WHERE email IS NOT NULL
     GROUP BY email HAVING COUNT(*) > 1`
  );
  const dupUsernames = await prisma.$queryRawUnsafe<{ username: string | null; c: bigint }[]>(
    `SELECT username, COUNT(*)::bigint AS c
     FROM "MyProfile" WHERE username IS NOT NULL
     GROUP BY username HAVING COUNT(*) > 1`
  );

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
}

run()
  .catch((e) => {
    console.error('❌ sanity-check failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
