'use client';

import Image from 'next/image';
import { getAgeGroup } from '@/lib/ageUtils';

interface ProfilePublicProps {
  username: string;
  image?: string;
  bannerImage?: string;
  about?: string;
  birthdate: string;
}

export default function ProfilePublic({
  username,
  image,
  bannerImage,
  about,
  birthdate,
}: ProfilePublicProps) {
  return (
    <div className="rounded-lg border bg-white shadow-md overflow-hidden max-w-3xl mx-auto">
      {/* Banner */}
      {bannerImage && (
        <div className="w-full h-40 relative">
          <Image
            src={bannerImage}
            alt={`${username}'s banner`}
            layout="fill"
            objectFit="cover"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Avatar + Info */}
      <div className="p-6 flex flex-col items-center text-center">
        {image && (
          <Image
            src={image}
            alt={`${username}'s avatar`}
            width={96}
            height={96}
            className="rounded-full border shadow mb-4"
          />
        )}
        <h2 className="text-xl font-semibold text-[#202020]">{username}</h2>

        <p className="text-sm text-gray-500 italic mt-1">
          Age Group: {getAgeGroup(birthdate).group}
        </p>

        {about && (
          <p className="mt-2 text-sm text-gray-600 max-w-sm">{about}</p>
        )}
      </div>
    </div>
  );
}
