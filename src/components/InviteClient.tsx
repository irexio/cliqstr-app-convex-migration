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
      console.log('Sending invite request:', { cliqId, inviteeEmail, invitedRole });
      
      const res = await fetch(`/api/invite/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliqId, inviteeEmail, invitedRole }),
      });

      const json = await res.json();
      console.log('Invite response:', json);

      // Handle different response status codes with user-friendly messages
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error(json?.error || 'Please check the email and role selection');
        } else if (res.status === 401) {
          throw new Error('Your session has expired. Please sign in again.');
        } else if (res.status === 403) {
          throw new Error('You don\'t have permission to invite to this cliq.');
        } else if (res.status === 404) {
          throw new Error('This cliq could not be found. It may have been deleted.');
        } else if (res.status === 409) {
          // This is actually a success case - the invite already exists
          setSuccessType(json?.type || 'invite');
          setInviteeEmail('');
          return;
        } else {
          throw new Error(json?.error || 'Unexpected error. Please try again later.');
        }
      }

      // Handle success responses
      if (json?.message === 'Invite already exists') {
        setSuccessType(json.type);
        setInviteeEmail('');
        setError('This person has already been invited to this cliq.');
      } else if (json?.type === 'request' || json?.type === 'invite') {
        setSuccessType(json.type);
        setInviteeEmail('');
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err: any) {
      console.error('Invite error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
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
