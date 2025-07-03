// 🔐 APA-SAFE — Loads cliq feed and verifies membership

import { prisma } from '@/lib/prisma';
import CliqProfileContent from '@/components/CliqProfileContent';
import PostForm from '@/components/PostForm';
import CliqFeed from '@/components/CliqFeed';
import { getCurrentUser } from '@/lib/auth/getCurrentUser'; // ✅ uses correct APA-safe session
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface CliqPageServerProps {
  cliqId: string;
}

export default async function CliqPageServer({ cliqId }: CliqPageServerProps) {
  const session = await getCurrentUser();
  if (!session?.id) return notFound();

  // Fetch cliq with minimal membership info
  const cliq = await prisma.cliq.findUnique({
    where: { id: cliqId },
    include: {
      memberships: {
        select: { userId: true },
      },
    },
  });

  if (!cliq) {
    console.warn(`❌ Cliq not found for ID: ${cliqId}`);
    return notFound();
  }

  const isMember = cliq.memberships.some((m) => m.userId === session.id);
  if (!isMember) {
    console.warn(`⚠️ User ${session.id} is not a member of cliq ${cliqId}`);
    return (
      <main className="p-6 max-w-xl mx-auto text-center text-red-500 font-medium">
        You do not have access to this cliq. Please ask the owner to invite you.
      </main>
    );
  }

  // Fetch posts for this cliq
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

  // Extract only the fields needed for CliqProfileContent
  const cliqProfile = {
    name: cliq.name,
    description: cliq.description || undefined, // Convert null to undefined
    bannerImage: cliq.coverImage || undefined, // Use coverImage as bannerImage
  };

  return (
    <div className="space-y-6">
      <CliqProfileContent cliq={cliqProfile} />
      <PostForm cliqId={cliqId} />
      <CliqFeed cliqId={cliqId} />
    </div>
  );
}
