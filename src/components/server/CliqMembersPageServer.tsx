// 🔐 APA-HARDENED — DEBUG VERSION for CliqPageServer.tsx

import { prisma } from '@/lib/prisma';
import CliqProfileContent from '@/components/CliqProfileContent';
import PostForm from '@/components/PostForm';
import CliqFeed from '@/components/CliqFeed';
import { getServerSession } from '@/lib/auth/getServerSession';
import { notFound } from 'next/navigation';

interface CliqPageServerProps {
  cliqId: string;
}

export default async function CliqPageServer({ cliqId }: CliqPageServerProps) {
  const session = await getServerSession();

  console.log('🧪 SESSION:', session);

  if (!session || !session.user?.id) {
    console.warn('⚠️ No session or user ID — returning notFound()');
    return notFound();
  }

  const cliq = await prisma.cliq.findUnique({
    where: { id: cliqId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  image: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cliq) {
    console.warn('❌ Cliq not found for ID:', cliqId);
    return notFound();
  }

  console.log(`✅ Cliq "${cliq.name}" found. Members: ${cliq.members.length}`);

  const posts = await prisma.post.findMany({
    where: { cliqId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          profile: {
            select: { username: true, image: true },
          },
        },
      },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              profile: {
                select: { username: true, image: true },
              },
            },
          },
        },
      },
    },
  });

  console.log(`✅ Posts loaded: ${posts.length}`);

  return (
    <main className="flex flex-col md:flex-row h-screen bg-white text-neutral-800">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 p-4 border-r border-neutral-200">
        <div className="font-semibold text-lg mb-2">{cliq.name}</div>
        <p className="text-sm text-neutral-600">{cliq.description}</p>
        <div className="mt-4 text-xs text-neutral-400">
          {cliq.members.length} member{cliq.members.length !== 1 && 's'}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {cliq.members.map((m) => (
            <img
              key={m.user.id}
              src={m.user.profile?.image || '/default-avatar.png'}
              alt="Cliq member"
              title={m.user.profile?.username || 'Cliq member'}
              className="w-8 h-8 rounded-full border"
            />
          ))}
        </div>
      </aside>

      {/* FEED WRAP */}
      <section className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">{cliq.name}</h1>
          <CliqProfileContent cliqId={cliq.id} />
          <PostForm cliqId={cliq.id} />
          <CliqFeed posts={posts} />
        </div>
      </section>
    </main>
  );
}
