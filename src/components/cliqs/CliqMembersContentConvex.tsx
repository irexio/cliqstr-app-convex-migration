'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { resolveDisplayName } from '@/lib/utils/nameUtils';
import { useAuth } from '@/lib/auth/useAuth';

interface CliqMembersContentConvexProps {
  cliqId: string;
}

export default function CliqMembersContentConvex({ cliqId }: CliqMembersContentConvexProps) {
  const { user } = useAuth();
  
  // Get cliq members using Convex
  const members = useQuery(api.cliqs.getCliqMembers, 
    user?.id ? { cliqId: cliqId as Id<"cliqs"> } : "skip"
  );

  if (!user?.id) {
    return <div className="p-6 text-center text-gray-500">Please log in to view members.</div>;
  }

  if (members === undefined) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading members...</p>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return <div className="p-6 text-center text-gray-500">No members found.</div>;
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-4 p-4 border rounded-md">
          <UserAvatar 
            image={member.profile?.image}
            name={member.profile ? `${member.profile.firstName || ''} ${member.profile.lastName || ''}`.trim() || member.profile.username : 'Unknown'}
            userId={member.id}
            size="md"
          />
          <div className="flex-1">
            <p className="font-semibold">
              {member.profile ? `${member.profile.firstName || ''} ${member.profile.lastName || ''}`.trim() || member.profile.username : 'Unknown'}
            </p>
            <p className="text-sm text-gray-600">Role: {member.role}</p>
            <p className="text-sm text-gray-600">
              Joined: {new Date(member.joinedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

