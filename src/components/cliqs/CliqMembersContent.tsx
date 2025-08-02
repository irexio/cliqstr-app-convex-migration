'use client';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { resolveDisplayName } from '@/lib/utils/nameUtils';

// 🔐 APA-HARDENED — Cliq Members Client Component
// Receives full members array as a prop — no fetchJson required
// Fully detached from any legacy API routes

interface Member {
  id: string;
  email: string;
  account?: {
    role: string;
    isApproved: boolean;
  };
  myProfile?: {
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
  } | null;
}

interface CliqMembersContentProps {
  members: Member[];
}

export default function CliqMembersContent({ members }: CliqMembersContentProps) {
  if (!members.length) {
    return <div className="p-6 text-center text-gray-500">No members found.</div>;
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-4 p-4 border rounded-md">
          <UserAvatar 
            image={member.myProfile?.image}
            name={resolveDisplayName(member)}
            userId={member.id}
            size="md"
          />
          <div className="flex-1">
            <p className="font-semibold">{resolveDisplayName(member)}</p>
            <p className="text-sm text-gray-600">Role: {member.account?.role || 'N/A'}</p>
            <p className="text-sm text-gray-600">
              Approved: {member.account?.isApproved ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

