import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import CliqMembersContent from '@/components/CliqMembersContent';
import CliqProfileContent from '@/components/CliqProfileContent';
import PostForm from '@/components/PostForm';
import CliqFeed from '@/components/CliqFeed';

export default async function CliqMembersPageServer({ cliqId }: { cliqId: string }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const posts = await prisma.post.findMany({
    where: { cliqId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          profile: {
            select: {
              username: true, // ✅ exists
            },
          },
        },
      },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              profile: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <CliqProfileContent cliqId={cliqId} />
      <PostForm cliqId={cliqId} />
      <CliqFeed posts={posts} />
      <CliqMembersContent cliqId={cliqId} currentUserId={user.id} />
    </main>
  );
}
