'use client';

// 🔐 APA-HARDENED — InviteClient
// Used in /cliqs/[id]/invite page for form submission

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';

interface InviteClientProps {
  cliqId: string;
  inviterId: string;
}

export default function InviteClient({ cliqId, inviterId }: InviteClientProps) {
  const router = useRouter();

  const [inviteeEmail, setInviteeEmail] = useState('');
  const [invitedRole, setInvitedRole] = useState<'child' | 'adult' | 'parent'>('child');
  const [error, setError] = useState('');
  const [successType, setSuccessType] = useState<'invite' | 'request' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessType('');
    setLoading(true);

    try {
      const res = await fetch(`/api/invite/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliqId, inviterId, inviteeEmail, invitedRole }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || 'Unexpected response');

      if (json?.type === 'request' || json?.type === 'invite') {
        setSuccessType(json.type);
        setInviteeEmail('');
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="inviteeEmail">Invitee Email</Label>
        <Input
          id="inviteeEmail"
          type="email"
          value={inviteeEmail}
          onChange={(e) => setInviteeEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="invitedRole">Invite Role</Label>
        <select
          id="invitedRole"
          value={invitedRole}
          onChange={(e) => setInvitedRole(e.target.value as any)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="child">Child</option>
          <option value="adult">Adult</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {successType && (
        <p className="text-green-600 text-sm">
          {successType === 'invite' ? 'Invite sent!' : 'Request sent to parent for approval.'}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Invite'}
      </Button>
    </form>
  );
}
