'use client';

import BaseCard from './BaseCard';
import { Mail, UserCheck, Ban } from 'lucide-react';

interface InviteCardProps {
  inviteeEmail: string;
  cliqName: string;
  status?: 'pending' | 'accepted' | 'declined';
}

export default function InviteCard({ inviteeEmail, cliqName, status = 'pending' }: InviteCardProps) {
  const statusMap = {
    pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Mail },
    accepted: { text: 'Accepted', color: 'bg-green-100 text-green-800', icon: UserCheck },
    declined: { text: 'Declined', color: 'bg-red-100 text-red-800', icon: Ban },
  };

  const StatusIcon = statusMap[status].icon;

  return (
    <BaseCard>
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-600">Invite sent to:</div>
        <div className="text-base font-medium">{inviteeEmail}</div>
        <div className="text-sm text-gray-500">Cliq: {cliqName}</div>

        <div
          className={`mt-2 inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ${statusMap[status].color}`}
        >
          <StatusIcon className="w-4 h-4" />
          {statusMap[status].text}
        </div>
      </div>
    </BaseCard>
  );
}
