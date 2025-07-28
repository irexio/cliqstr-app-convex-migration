'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface CliqBannerProps {
  cliq: {
    id: string;
    name: string;
    description?: string;
    privacy: string;
    bannerImage?: string;
    _count?: {
      memberships: number;
    };
  };
  isOwner?: boolean;
}

export default function CliqBanner({ cliq, isOwner = false }: CliqBannerProps) {
  const router = useRouter();

  const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const bannerStyle = cliq.bannerImage 
    ? { backgroundImage: `url(${cliq.bannerImage})` }
    : { background: defaultGradient };

  return (
    <header 
      className="relative h-60 bg-cover bg-center flex items-end p-6"
      style={bannerStyle}
    >
      {/* Back button */}
      <button
        onClick={() => router.push('/my-cliqs-dashboard')}
        className="absolute top-6 left-6 bg-white/20 text-white border-none py-2 px-4 rounded-full cursor-pointer text-sm backdrop-blur-sm hover:bg-white/30 transition-colors"
      >
        ← Back to My Cliqs
      </button>

      {/* Members button */}
      <button
        onClick={() => router.push(`/cliqs/${cliq.id}/members`)}
        className="absolute top-6 right-6 bg-white/20 text-white border-none py-2 px-4 rounded-full cursor-pointer text-sm backdrop-blur-sm hover:bg-white/30 transition-colors"
      >
        👥 Members
      </button>

      {/* Edit banner button for owners */}
      {isOwner && (
        <button
          className="absolute bottom-6 right-6 bg-black/50 text-white border-none py-2 px-4 rounded-full cursor-pointer text-sm backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          🖼️ Edit Banner
        </button>
      )}

      {/* Cliq info */}
      <div className="text-white">
        <h1 className="text-3xl font-bold mb-2">{cliq.name}</h1>
        {cliq.description && (
          <p className="text-base opacity-90 mb-2">{cliq.description}</p>
        )}
        <div className="flex gap-4 items-center text-sm opacity-80">
          <span>
            {cliq.privacy === 'PRIVATE' ? '🔒' : cliq.privacy === 'PUBLIC' ? '🌍' : '👥'} 
            {' '}{cliq.privacy.charAt(0) + cliq.privacy.slice(1).toLowerCase()} Cliq
          </span>
          {cliq._count?.memberships && (
            <span>{cliq._count.memberships} members</span>
          )}
          <span>Active today</span>
        </div>
      </div>
    </header>
  );
}