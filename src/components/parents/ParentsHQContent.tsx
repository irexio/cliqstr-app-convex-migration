'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ParentDashboard from './ParentDashboard';
import ChildInviteApprovalFlow from './ChildInviteApprovalFlow';

type InviteStatus = 'valid' | 'used' | 'invalid' | 'loading';

export default function ParentsHQContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('inviteCode');
  const router = useRouter();

  const [status, setStatus] = useState<InviteStatus>('loading');

  useEffect(() => {
    if (!inviteCode) {
      setStatus('valid'); // no invite → show dashboard
      return;
    }

    // Validate the invite
    const checkInvite = async () => {
      try {
        const res = await fetch(`/api/invites/validate?code=${inviteCode}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setStatus('valid');
        } else if (data.reason === 'used') {
          setStatus('used');
        } else {
          setStatus('invalid');
        }
      } catch (err) {
        console.error('[APA] Invite validation failed:', err);
        setStatus('invalid');
      }
    };

    checkInvite();
  }, [inviteCode]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking invite status...</p>
      </main>
    );
  }

  if (status === 'used') {
    return (
      <main className="min-h-screen flex items-center justify-center text-center text-gray-600">
        <div>
          <h1 className="text-xl font-bold text-red-600">Invite Already Used</h1>
          <p className="mt-2">This invitation has already been accepted. If you believe this is an error, please contact support.</p>
        </div>
      </main>
    );
  }

  if (status === 'invalid') {
    return (
      <main className="min-h-screen flex items-center justify-center text-center text-gray-600">
        <div>
          <h1 className="text-xl font-bold text-red-600">Invalid Invitation</h1>
          <p className="mt-2">This invite link is no longer valid. You may request a new invite from the user who sent it.</p>
        </div>
      </main>
    );
  }

  // If valid, render invite approval flow or dashboard
  if (inviteCode) {
    return <ChildInviteApprovalFlow inviteCode={inviteCode} />;
  }

  return <ParentDashboard />;
}
