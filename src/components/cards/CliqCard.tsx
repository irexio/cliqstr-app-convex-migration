'use client';

import Image from 'next/image';
import Link from 'next/link';
import BaseCard from './BaseCard';
import { LockIcon, Globe, Users } from 'lucide-react';

interface CliqCardProps {
  cliq: {
    id: string;
    name: string;
    description: string;
    privacy: string;
    createdAt: string;
    ownerId: string;
    bannerImage?: string;
    coverImage?: string;
  };
}

export default function CliqCard({ cliq }: CliqCardProps) {
  // Format date to be more readable
  const formattedDate = new Date(cliq.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Determine which privacy icon to show
  const PrivacyIcon = () => {
    switch(cliq.privacy.toLowerCase()) {
      case 'private':
        return <LockIcon className="h-4 w-4" />;
      case 'public':
        return <Globe className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Link href={`/cliq/${cliq.id}`}>
      <BaseCard className="h-full">
        <div className="flex flex-col h-full">
          {/* Banner image if available */}
          {cliq.bannerImage && (
            <div className="relative h-32 w-full mb-4 -mt-4 -mx-4 overflow-hidden rounded-t-2xl">
              <Image
                src={cliq.bannerImage}
                alt={`${cliq.name} banner`}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex-grow">
            {/* Header with name and privacy icon */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{cliq.name}</h3>
              <div className="text-gray-500">
                <PrivacyIcon />
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">{cliq.description}</p>

            {/* Footer with date */}
            <div className="text-xs text-gray-500 mt-auto">
              Created on {formattedDate}
            </div>
          </div>
        </div>
      </BaseCard>
    </Link>
  );
}
