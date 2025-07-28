'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProfileSidebarProps {
  isOwner: boolean;
  onEditProfile?: () => void;
  onEditCover?: () => void;
}

export function ProfileSidebar({ isOwner, onEditProfile, onEditCover }: ProfileSidebarProps) {
  const router = useRouter();

  if (!isOwner) return null;

  return (
    <aside className="hidden md:block bg-black text-white w-64 p-6">
      <nav className="space-y-2">
        <button
          onClick={onEditProfile}
          className="w-full flex items-center gap-3 px-4 py-3 text-white no-underline font-medium text-base transition-all duration-200 border-l-[3px] border-transparent hover:bg-gray-900 hover:border-white text-left"
        >
          ✏️ Edit Profile
        </button>
        
        <button
          onClick={onEditCover}
          className="w-full flex items-center gap-3 px-4 py-3 text-white no-underline font-medium text-base transition-all duration-200 border-l-[3px] border-transparent hover:bg-gray-900 hover:border-white text-left"
        >
          🖼️ Edit Cover
        </button>
        
        <Link
          href="/my-cliqs-dashboard"
          className="flex items-center gap-3 px-4 py-3 text-white no-underline font-medium text-base transition-all duration-200 border-l-[3px] border-transparent hover:bg-gray-900 hover:border-white"
        >
          ← Back to My Cliqs
        </Link>
      </nav>
    </aside>
  );
}