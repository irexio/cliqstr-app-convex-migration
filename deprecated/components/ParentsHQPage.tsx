'use client';

import { useEffect, useState } from 'react';

/**
 * @deprecated - This component is deprecated in favor of ChildInviteApprovalFlow
 * which serves as the main Parent HQ interface for child permission setup.
 * 
 * All child permission setup now happens in ChildInviteApprovalFlow component.
 * This ensures every child has parents complete required permissions.
 */

interface ParentsHQContentProps {
  inviteCode?: string;
}

export default function ParentsHQContent({ inviteCode }: ParentsHQContentProps) {
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Received inviteCode:', inviteCode);

    if (!inviteCode) {
      console.warn('⚠️ No invite code provided');
      setError('Missing invite code.');
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        const res = await fetch(`/api/invites/validate?code=${inviteCode}`);
        console.log('🔁 Validation response status:', res.status);

        const data = await res.json();
        console.log('📦 Validation response data:', data);

        if (!res.ok || !data.valid) {
          throw new Error(data.error || 'Invalid or expired invite code');
        }

        if (!data.invite) {
          throw new Error('Invite data missing in server response.');
        }

        setInvite(data.invite);
      } catch (err: any) {
        console.error('❌ Failed to fetch or validate invite:', err);
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [inviteCode]);

  if (loading) return <div>⏳ Loading invite details...</div>;
  if (error) return <div className="text-red-600">❌ {error}</div>;

  if (!invite || typeof invite !== 'object') {
    console.error('🚨 Invalid invite object structure:', invite);
    return <div className="text-red-600">⚠️ Invite data is invalid or missing required fields.</div>;
  }

  const childName = invite?.friendFirstName || 'Unnamed';
  const cliqName = invite?.cliqName || 'Unknown';

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">👨‍👧 Parent Invite Approval</h2>
      <p><strong>Child Name:</strong> {childName}</p>
      <p><strong>Cliq Name:</strong> {cliqName}</p>
      <p className="mt-4 text-gray-600">
        ✅ Invite validated! Please <a href={`/parents/hq?inviteCode=${inviteCode}`} className="text-blue-600 underline">complete your child's setup in Parent HQ</a>.
      </p>
    </div>
  );
}
