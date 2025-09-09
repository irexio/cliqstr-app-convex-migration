import { prisma } from '@/lib/prisma';

async function main() {
  const emailsToDelete = [
    'mimi@cliqstr.com',
    'robynpthomas@gmail.com',
    'lena@cliqstr.com',
  ];

  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { in: emailsToDelete } },
  });

  console.log(`✅ Deleted ${deletedUsers.count} test user(s).`);
}

main()
  .catch((err) => {
    console.error('❌ Error during cleanup:', err);
  })
  .finally(() => {
    process.exit();
  });
