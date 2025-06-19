'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';

interface InviteRequest {
  id: string;
  cliqName: string;
  invitedRole: string;
  inviteeEmail: string;
  message?: string;
  childName: string;
}

export default function ParentsHQPage() {
  const router = useRouter();

  const [canPostImages, setCanPostImages] = useState(true);
  const [canShareYouTube, setCanShareYouTube] = useState(false);
  const [canAccessGames, setCanAccessGames] = useState(true);
  const [canSendInvites, setCanSendInvites] = useState(false);
  const [visibilityLevel, setVisibilityLevel] = useState<'summary' | 'flagged' | 'full'>('flagged');

  const [requests, setRequests] = useState<InviteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const res = await fetch('/api/parent/invite-requests');
        const data = await res.json();
        setRequests(data.requests || []);
      } catch (err) {
        console.error('Error loading requests:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch('/api/invite-request/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id }),
    });

    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } else {
      console.error('Failed to approve invite request');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">Welcome to Parents HQ</h1>

      <p className="text-gray-700 text-sm">
        Your child’s account is now active. As their parent, you have full control over what they can access and who they can connect with on Cliqstr.
      </p>

      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md text-sm text-gray-800">
        <p><strong>Reminder:</strong> Be sure to make a note of your child’s username and password. If needed, you can help them log in for the first time.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Permissions</h2>

        <Toggle
          label="Allow image sharing"
          enabled={canPostImages}
          onChange={setCanPostImages}
        />
        <Toggle
          label="Allow YouTube sharing (13+ only)"
          enabled={canShareYouTube}
          onChange={setCanShareYouTube}
        />
        <Toggle
          label="Allow access to games"
          enabled={canAccessGames}
          onChange={setCanAccessGames}
        />
        <Toggle
          label="Allow sending invites to other users"
          enabled={canSendInvites}
          onChange={setCanSendInvites}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Visibility
          </label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={visibilityLevel}
            onChange={(e) => setVisibilityLevel(e.target.value as any)}
          >
            <option value="summary">Summary only</option>
            <option value="flagged">Flagged content only</option>
            <option value="full">Full access to all child activity</option>
          </select>
        </div>
      </div>

      <div className="pt-10 space-y-4">
        <h2 className="text-lg font-semibold text-indigo-700">Pending Invite Approvals</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading pending requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-500">No pending invites at this time.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="p-4 bg-white border rounded space-y-2">
              <p><strong>{req.childName}</strong> wants to invite <strong>{req.inviteeEmail}</strong> ({req.invitedRole}) to <strong>{req.cliqName}</strong>.</p>
              {req.message && (
                <p className="text-sm text-gray-600 italic">“{req.message}”</p>
              )}
              <Button size="sm" onClick={() => handleApprove(req.id)}>
                Approve
              </Button>
            </div>
          ))
        )}
      </div>

      <p className="text-sm text-gray-600 mt-6">
        Want guidance on what settings are best for your child’s age? Visit our{' '}
        <a href="/parent-best-practices" className="underline text-indigo-600 hover:text-indigo-800">
          Parent Best Practices
        </a>{' '}
        page.
      </p>

      <Button className="mt-8 w-full" onClick={() => router.push('/my-cliqs')}>
        Go to My Dashboard
      </Button>
    </div>
  );
}

function Toggle({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <Switch
        checked={enabled}
        onChange={onChange}
        className={`${enabled ? 'bg-indigo-600' : 'bg-gray-300'}
          relative inline-flex h-5 w-10 items-center rounded-full transition`}
      >
        <span
          className={`${enabled ? 'translate-x-5' : 'translate-x-1'}
            inline-block h-4 w-4 transform bg-white rounded-full transition`}
        />
      </Switch>
    </div>
  );
}
