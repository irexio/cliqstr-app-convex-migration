'use server';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProfilePublic from '@/components/ProfilePublic';

export default async function ProfilePageServer({ username }: { username: string }) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    select: {
      username: true,
      image: true,
      bannerImage: true,
      about: true,
      birthdate: true,
    },
  });

  if (!profile) return notFound();

  return (
    <div className="py-10 px-4">
      <ProfilePublic
        username={profile.username}
        image={profile.image || undefined}
        bannerImage={profile.bannerImage || undefined}
        about={profile.about || undefined}
        birthdate={profile.birthdate.toISOString()}
      />
    </div>
  );
}
