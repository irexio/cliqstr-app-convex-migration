'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface CliqBannerProps {
  cliq: {
    id: string;
    name: string;
    description?: string;
    privacy: string;
    coverImage?: string;
    _count?: {
      memberships: number;
    };
  };
  isOwner?: boolean;
}

export default function CliqBanner({ cliq, isOwner = false }: CliqBannerProps) {
  return (
    <div className="mb-6">
      {/* Cover Image or Black Fallback */}
      {cliq.coverImage ? (
        <img 
          src={cliq.coverImage} 
          alt="Cliq Banner" 
          className="w-full h-48 object-cover rounded-t-xl" 
        />
      ) : (
        <div className="w-full h-48 bg-black rounded-t-xl" />
      )}
      
      {/* Cliq Info */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{cliq.name}</h1>
        {cliq.description && (
          <p className="text-gray-600 mb-3">{cliq.description}</p>
        )}
        <div className="flex gap-4 items-center text-sm text-gray-500">
          <span>
            {cliq.privacy === 'PRIVATE' ? '🔒' : cliq.privacy === 'PUBLIC' ? '🌍' : '👥'} 
            {' '}{cliq.privacy.charAt(0) + cliq.privacy.slice(1).toLowerCase()} Cliq
          </span>
          {cliq._count?.memberships && (
            <span>{cliq._count.memberships} members</span>
          )}
        </div>
      </div>
    </div>
  );
}