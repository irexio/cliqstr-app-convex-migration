// 🔐 APA-HARDENED — Public Profile Page
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProfilePublic from '@/components/ProfilePublic';

export default async function Page({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;

  const profile = await prisma.profile.findUnique({
    where: { username: handle },
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
