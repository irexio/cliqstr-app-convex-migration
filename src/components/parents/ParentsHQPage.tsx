'use client';

import { useEffect, useState } from 'react';

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
      setError('Missing invite code.');
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        const res = await fetch(`/api/invites/validate?code=${inviteCode}`);
        if (!res.ok) throw new Error('Invite not found or expired.');
        const data = await res.json();
        console.log('📦 Invite fetched:', data);
        setInvite(data.invite);
      } catch (err: any) {
        console.error('❌ Failed to fetch invite:', err);
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [inviteCode]);

  if (loading) {
    return <div>⏳ Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">❌ {error}</div>;
  }

  if (!invite || typeof invite !== 'object') {
    console.error('🚨 Invalid invite object:', invite);
    return <div>⚠️ Invite data is invalid or missing required fields.</div>;
  }

  const childName = invite?.friendFirstName || 'Unnamed';
  const cliqName = invite?.cliqName || 'Unknown';

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">👨‍👧 Parent Invite Approval</h2>
      <p><strong>Child Name:</strong> {childName}</p>
      <p><strong>Cliq Name:</strong> {cliqName}</p>
      <p className="mt-4 text-gray-600">✅ Invite loaded successfully. Approval form goes here next.</p>
    </div>
  );
}
