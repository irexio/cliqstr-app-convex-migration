'use client';

/**
 * 🔐 APA-HARDENED COMPONENT: InviteClient
 *
 * Used in: /cliqs/[id]/invite/page.tsx
 *
 * Purpose:
 *   - Renders the invite form to add a child, adult, or parent to a cliq
 *   - Submits invite data to /api/invite/create
 *   - Displays success or error messages
 *
 * Notes:
 *   - Requires a valid `cliqId` prop (string)
 *   - Uses fetch POST with JSON payload
 *   - No direct use of inviterId (auth handled server-side)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';

interface InviteClientProps {
  cliqId: string;
}

export default function InviteClient({ cliqId }: InviteClientProps) {
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
        body: JSON.stringify({ cliqId, inviteeEmail, invitedRole }),
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
  <Label>Invite Role</Label>
  <div className="flex gap-4 mt-2">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="invitedRole"
        value="child"
        checked={invitedRole === 'child'}
        onChange={() => setInvitedRole('child')}
      />
      Child
    </label>
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="invitedRole"
        value="adult"
        checked={invitedRole === 'adult'}
        onChange={() => setInvitedRole('adult')}
      />
      Adult
    </label>
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="invitedRole"
        value="parent"
        checked={invitedRole === 'parent'}
        onChange={() => setInvitedRole('parent')}
      />
      Parent
    </label>
  </div>
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
