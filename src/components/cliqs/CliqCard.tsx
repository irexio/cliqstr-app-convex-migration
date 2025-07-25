'use client';

// 🔐 APA-HARDENED — Cliq Card for Dashboard View
import Link from 'next/link';
import Image from 'next/image';
import BaseCard from './BaseCard';
import { CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/Button';
import InviteModal from '@/components/cliqs/InviteModal';
import MembersModal from '@/components/cliqs/MembersModal';
import { useState } from 'react';

interface CliqCardProps {
  cliq: {
    id: string;
    name: string;
    description?: string | null;
    privacy: string;
    coverImage?: string | null;
    ownerId?: string;
  };
  currentUserId?: string;
}

export default function CliqCard({ cliq, currentUserId }: CliqCardProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  
  // Check if current user is the owner
  const isOwner = currentUserId && cliq.ownerId === currentUserId;

  return (
    <BaseCard className="p-0 overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Card Clickable Area */}
      <Link href={`/cliqs/${cliq.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary">
        {/* Cover Image or Gradient */}
        {cliq.coverImage ? (
          <div className="relative w-full h-48">
            <Image
              src={cliq.coverImage}
              alt={`${cliq.name} banner image`}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300" />
        )}
        <div className="p-6">
          <CardTitle className="text-xl font-bold mb-1">{cliq.name}</CardTitle>
          <p className="text-sm text-gray-500 mb-3 capitalize">{cliq.privacy} Cliq</p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {cliq.description || 'I like to socialize in private. You? If so, welcome to Cliqstr.com'}
          </p>
        </div>
      </Link>
      {/* Action Buttons */}
      <div className="flex items-center gap-4 px-6 pb-6">
        <Link href={`/cliqs/${cliq.id}`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span className="text-sm font-medium">View</span>
        </Link>
        
        <button onClick={() => setMembersModalOpen(true)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className="text-sm font-medium">Members</span>
        </button>
        
        <button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="text-sm font-medium">Invite</span>
        </button>
        
        {isOwner && (
          <Link href={`/cliqs/${cliq.id}/edit`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors ml-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span className="text-sm font-medium">Edit</span>
          </Link>
        )}
      </div>
      <InviteModal cliqId={cliq.id} open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
      <MembersModal cliqId={cliq.id} open={membersModalOpen} onClose={() => setMembersModalOpen(false)} />
    </BaseCard>
  );
}
