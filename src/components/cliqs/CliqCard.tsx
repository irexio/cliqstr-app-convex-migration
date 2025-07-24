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
          <div className="relative w-full h-32">
            <Image
              src={cliq.coverImage}
              alt={cliq.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-blue-900 via-purple-600 to-pink-600" />
        )}
        <div className="p-4">
          <CardTitle className="text-lg font-semibold mb-1 truncate">{cliq.name}</CardTitle>
          <p className="text-xs text-gray-500 mb-1">{cliq.privacy} Cliq</p>
          <p className="text-sm text-neutral-700 line-clamp-2 min-h-[2.5em]">
            {cliq.description || 'No description yet.'}
          </p>
        </div>
      </Link>
      {/* Action Buttons */}
      <div className="flex gap-2 px-4 pb-4 mt-auto">
        <Link href={`/cliqs/${cliq.id}`} className="flex-1">
          <Button className="w-full">
            View
          </Button>
        </Link>
        {isOwner && (
          <Link href={`/cliqs/${cliq.id}/edit`}>
            <Button variant="outline">
              Edit
            </Button>
          </Link>
        )}
        <Button variant="outline" onClick={() => setMembersModalOpen(true)}>
          Members
        </Button>
        {isOwner && (
          <Button variant="outline" onClick={() => setInviteModalOpen(true)}>
            Invite
          </Button>
        )}
      </div>
      <InviteModal cliqId={cliq.id} open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
      <MembersModal cliqId={cliq.id} open={membersModalOpen} onClose={() => setMembersModalOpen(false)} />
    </BaseCard>
  );
}
