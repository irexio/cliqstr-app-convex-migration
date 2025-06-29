import { prisma } from '@/lib/prisma';
import CliqProfileContent from '@/components/CliqProfileContent';
import PostForm from '@/components/PostForm';
import CliqFeed from '@/components/CliqFeed';
import { getServerSession } from '@/lib/auth/getServerSession';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface CliqPageServerProps {
  cliqId: string;
}

export default async function CliqPageServer({ cliqId }: CliqPageServerProps) {
  const session = await getServerSession();
  if (!session || !session.user?.id) return notFound();

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
    console.warn(`❌ Cliq not found for ID: ${cliqId}`);
    return notFound();
  }

  const isMember = cliq.members.some((m) => m.user.id === session.user.id);

  if (!isMember) {
    console.warn(`⚠️ User ${session.user.id} is not a member of cliq ${cliqId}`);
    return (
      <main className="p-6 max-w-xl mx-auto text-center text-red-500 font-medium">
        You do not have access to this cliq. Please ask the owner to invite you.
      </main>
    );
  }

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

  const bannerImage = cliq.coverImage || '/placeholder-banner.jpg';

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <main className="flex-grow px-4 py-8 max-w-4xl mx-auto space-y-6">
        {/* COVER IMAGE */}
        <div className="w-full h-48 relative rounded-md overflow-hidden">
          <Image
            src={bannerImage}
            alt="Cliq cover"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800">{cliq.name}</h1>
        <CliqProfileContent cliqId={cliq.id} />
        <PostForm cliqId={cliq.id} />
        <CliqFeed cliqId={cliq.id} />
      </main>

      <footer className="mt-10 border-t text-center text-sm text-neutral-500 py-6">
        © 2025 Cliqstr. Built with 💗 for families and friends.
      </footer>
    </div>
  );
}
