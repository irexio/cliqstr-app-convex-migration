'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { notFound } from 'next/navigation';
import InviteClient from '@/components/InviteClient';

interface InvitePageContentConvexProps {
  cliqId: string;
  currentUserId: string;
}

export default function InvitePageContentConvex({ 
  cliqId, 
  currentUserId 
}: InvitePageContentConvexProps) {
  // Get cliq data to check access permissions
  const cliq = useQuery(api.cliqs.getCliq, {
    cliqId: cliqId as Id<"cliqs">,
    userId: currentUserId as Id<"users">
  });

  // Loading state
  if (cliq === undefined) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-2 text-gray-600">Loading cliq...</p>
        </div>
      </div>
    );
  }

  // Cliq not found
  if (cliq === null) {
    notFound();
  }

  const isOwner = cliq.ownerId === currentUserId;

  // Block access if not owner and cliq is not public
  if (!isOwner && cliq.privacy !== 'public') {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Invite Someone to {cliq.name}</h1>
      <InviteClient cliqId={cliqId} />
    </div>
  );
}
