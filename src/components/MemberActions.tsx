'use client';

import { useState } from 'react';

interface MemberActionsProps {
  memberId: string;
  currentRole: string;
  cliqId: string;
}

export default function MemberActions({
  memberId,
  currentRole,
  cliqId,
}: MemberActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAction = async (action: 'changeRole' | 'remove', newRole?: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/cliqs/${cliqId}/member-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetUserId: memberId,
          newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess('Action completed');
      // optional: refresh UI
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-x-2 text-sm">
      {currentRole !== 'MODERATOR' && (
        <button
          onClick={() => handleAction('changeRole', 'MODERATOR')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          disabled={loading}
        >
          Promote to Moderator
        </button>
      )}
      <button
        onClick={() => handleAction('remove')}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        disabled={loading}
      >
        Remove
      </button>
      {error && <p className="text-red-500 mt-1">{error}</p>}
      {success && <p className="text-green-600 mt-1">{success}</p>}
    </div>
  );
}
