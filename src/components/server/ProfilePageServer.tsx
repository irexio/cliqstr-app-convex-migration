'use server';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProfilePublic from '@/components/ProfilePublic';

export default async function ProfilePageServer({ username }: { username: string }) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!profile) return notFound();

  const displayName = !profile?.username || profile.username.startsWith('user-')
    ? profile.user?.name || profile.user?.email?.split('@')[0] || 'New User'
    : profile.username;

  return (
    <div className="py-10 px-4">
      <ProfilePublic
        displayName={displayName}
        image={profile.image || undefined}
        bannerImage={profile.bannerImage || undefined}
        about={profile.about || undefined}
        birthdate={profile.birthdate.toISOString()}
      />
    </div>
  );
}
