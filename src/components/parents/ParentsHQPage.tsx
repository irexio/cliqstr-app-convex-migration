'use client';

import { useEffect, useState } from 'react';

// ✅ Add this interface to declare props
interface ParentsHQContentProps {
  inviteCode?: string;
}

// ✅ Accept props with correct type
export default function ParentsHQContent({ inviteCode }: ParentsHQContentProps) {
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteCode) {
      setError('Missing invite code.');
      return;
    }

    const fetchInvite = async () => {
      try {
        const res = await fetch(`/api/invites/validate?code=${inviteCode}`);
        if (!res.ok) throw new Error('Invite not found or expired.');
        const data = await res.json();
        setInvite(data.invite);
      } catch (err: any) {
        setError(err.message || 'Something went wrong.');
      }
    };

    fetchInvite();
  }, [inviteCode]);

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!invite) {
    return <div>Loading invite info...</div>;
  }

  return (
    <div>
      <p className="mb-4">
        You’ve been asked to approve <strong>{invite.childName || 'this child'}</strong> to join{' '}
        <strong>{invite.cliqName || 'a cliq'}</strong>.
      </p>
      {/* This is where we’ll plug in ChildInviteApprovalFlow */}
      <div>✨ Approval form goes here (coming soon)</div>
    </div>
  );
}
