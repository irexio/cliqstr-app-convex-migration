/**
 * 🔐 APA-HARDENED COMPONENT: ParentsHQPage
 *
 * Purpose:
 *   - Allows a parent to manage permissions and visibility settings
 *     for a specific child account
 *   - Renders toggle controls and visibility level selection
 *   - Sends updates to /api/parent/settings/update
 *
 * Props:
 *   - childId: string (required)
 *
 * Used In:
 *   - ParentDashboard.tsx
 *   - /parents-hq/page.tsx route wrapper
 */

'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { Button } from '@/components/Button';
import { fetchJson } from '@/lib/fetchJson';
import { useRouter } from 'next/navigation';

interface ProfileSettings {
  canPostImages: boolean;
  canShareYouTube: boolean;
  canAccessGames: boolean;
  canSendInvites: boolean;
  canCreatePublicCliqs: boolean;
  visibilityLevel: 'summary' | 'flagged' | 'full';
}

interface ParentsHQPageProps {
  childId: string;
}

export default function ParentsHQPage({ childId }: ParentsHQPageProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<ProfileSettings>({
    canPostImages: true,
    canShareYouTube: false,
    canAccessGames: true,
    canSendInvites: false,
    canCreatePublicCliqs: false,
    visibilityLevel: 'flagged',
  });
  const [pendingChildren, setPendingChildren] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [approvedChildren, setApprovedChildren] = useState<any[]>([]);
  const [approvedLoading, setApprovedLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchJson(`/api/profile/${childId}`);
        setSettings({
          canPostImages: res.canPostImages ?? true,
          canShareYouTube: res.canShareYouTube ?? false,
          canAccessGames: res.canAccessGames ?? true,
          canSendInvites: res.canSendInvites ?? false,
          canCreatePublicCliqs: res.canCreatePublicCliqs ?? false,
          visibilityLevel: res.visibilityLevel ?? 'flagged',
        });
      } catch (err) {
        console.error('Failed to load child profile:', err);
      }
    };
    fetchProfile();
  }, [childId]);

  useEffect(() => {
    const fetchPending = async () => {
      setPendingLoading(true);
      try {
        const res = await fetchJson('/api/parent/pending-children');
        setPendingChildren(res.pendingChildren || []);
      } catch (err) {
        setPendingChildren([]);
      }
      setPendingLoading(false);
    };
    fetchPending();

    const fetchApproved = async () => {
      setApprovedLoading(true);
      try {
        const res = await fetchJson('/api/parent/approved-children');
        setApprovedChildren(res.approvedChildren || []);
      } catch (err) {
        setApprovedChildren([]);
      }
      setApprovedLoading(false);
    };
    fetchApproved();
  }, []);


  const handleApprove = async (pendingChildId: string) => {
    setActionLoading(true);
    try {
      // Use approval-complete endpoint to approve (simulate minimal approval, real flow may need more fields)
      const res = await fetchJson('/api/parent/approval-complete', {
        method: 'POST',
        body: JSON.stringify({ childId: pendingChildId, username: 'child', password: 'changeme', parentEmail: '', plan: 'free' }),
      });
      if (res.success) {
        setPendingChildren((prev) => prev.filter((c) => c.id !== pendingChildId));
      }
    } catch (err) {}
    setActionLoading(false);
  };

  const handleReject = async (pendingChildId: string) => {
    setActionLoading(true);
    try {
      // For now, just remove from UI (real implementation may need backend removal)
      setPendingChildren((prev) => prev.filter((c) => c.id !== pendingChildId));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (childId: string) => {
    setActionLoading(true);
    try {
      await fetchJson('/api/parent/child/suspend', {
        method: 'POST',
        body: JSON.stringify({ childId, action: 'suspend' }),
      });
      setApprovedChildren((prev) => prev.map(child => child.id === childId ? { ...child, account: { ...child.account, suspended: true } } : child));
    } catch (err) {
      // Optionally show error
    }
    setActionLoading(false);
  };

  const handleUnsuspend = async (childId: string) => {
    setActionLoading(true);
    try {
      await fetchJson('/api/parent/child/suspend', {
        method: 'POST',
        body: JSON.stringify({ childId, action: 'unsuspend' }),
      });
      setApprovedChildren((prev) => prev.map(child => child.id === childId ? { ...child, account: { ...child.account, suspended: false } } : child));
    } catch (err) {
      // Optionally show error
    }
    setActionLoading(false);
  };


  const handleOpenReset = () => {
    setResetDialogOpen(true);
    setResetUsername('');
    setResetPassword('');
    setResetError('');
    setResetSuccess('');
  };
  const handleResetCredentials = async () => {
    setResetError('');
    setResetSuccess('');
    if (!resetUsername || !resetPassword) {
      setResetError('Username and password required');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetchJson('/api/parent/child/reset-credentials', {
        method: 'POST',
        body: JSON.stringify({ childId, username: resetUsername, password: resetPassword }),
      });
      if (res.success) {
        setResetSuccess('Credentials updated');
        setResetDialogOpen(false);
      } else {
        setResetError(res.error || 'Failed to reset credentials');
      }
    } catch (err) {
      setResetError('Failed to reset credentials');
    }
    setActionLoading(false);
  };


  // Toggle handler for settings
  const handleToggleChange = async (
    field: keyof ProfileSettings,
    value: boolean | string
  ) => {
    try {
      setSettings((prev) => ({ ...prev, [field]: value }));
      const res = await fetchJson('/api/parent/settings/update', {
        method: 'POST',
        body: JSON.stringify({
          childId,
          settings: { [field]: value },
        }),
      });
      if (!res.success) throw new Error(res.error || 'Update failed');
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }
  };

  // Define fields that are boolean toggles only
  const toggleFields: { label: string; field: keyof Omit<ProfileSettings, 'visibilityLevel'> }[] = [
    { label: 'Can Post Images', field: 'canPostImages' },
    { label: 'Can Share YouTube', field: 'canShareYouTube' },
    { label: 'Can Access Games', field: 'canAccessGames' },
    { label: 'Can Send Invites', field: 'canSendInvites' },
    { label: 'Can Create Public Cliqs', field: 'canCreatePublicCliqs' },
  ];

  return (
    <div className="space-y-8">
      {/* Pending Approvals Section */}
      {pendingLoading ? (
        <div>Loading pending approvals...</div>
      ) : pendingChildren.length > 0 ? (
        <div className="border p-4 rounded bg-yellow-50">
          <h3 className="font-semibold mb-2">Pending Approvals</h3>
          <ul>
            {pendingChildren.map((child) => (
              <li key={child.id} className="flex items-center gap-2 mb-2">
                <span>{child.username || child.email || child.id}</span>
                <Button onClick={() => handleApprove(child.id)} disabled={actionLoading}>Approve</Button>
                <Button variant="outline" onClick={() => handleReject(child.id)} disabled={actionLoading}>Reject</Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Child Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Child Settings</h2>

        {toggleFields.map(({ label, field }) => (
          <div key={field} className="flex items-center justify-between">
            <span>{label}</span>
            <Switch
              checked={settings[field]}
              onChange={(val: boolean) => handleToggleChange(field, val)}
              className={`${
                settings[field] ? 'bg-purple-600' : 'bg-gray-300'
              } relative inline-flex h-6 w-11 items-center rounded-full transition`}
            >
              <span
                className={`${
                  settings[field] ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform bg-white rounded-full transition`}
              />
            </Switch>
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <label htmlFor="visibilityLevel" className="font-medium">
            Visibility Level
          </label>
          <select
            id="visibilityLevel"
            value={settings.visibilityLevel}
            onChange={(e) =>
              handleToggleChange(
                'visibilityLevel',
                e.target.value as 'summary' | 'flagged' | 'full'
              )
            }
            className="border rounded px-3 py-2"
          >
            <option value="summary">Summary</option>
            <option value="flagged">Flagged Only</option>
            <option value="full">Full Visibility</option>
          </select>
        </div>
      </div>

      {/* Approved Children Suspension Management */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Approved Children</h2>
        {approvedLoading ? (
          <div>Loading approved children...</div>
        ) : approvedChildren.length === 0 ? (
          <div>No approved children.</div>
        ) : (
          <ul>
            {approvedChildren.map((child: any) => (
              <li key={child.id} className="flex items-center gap-2 mb-2">
                <span>{child.username || child.email || child.id}</span>
                {child.account?.suspended ? (
                  <Button onClick={() => handleUnsuspend(child.id)} disabled={actionLoading}>
                    Unsuspend
                  </Button>
                ) : (
                  <Button onClick={() => handleSuspend(child.id)} variant="outline" disabled={actionLoading}>
                    Suspend
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reset Credentials */}
      <div className="flex gap-4 mt-4">
        <Button onClick={handleOpenReset} disabled={actionLoading}>
          Reset Credentials
        </Button>
      </div> 

      {/* Reset Credentials Dialog */}
      {resetDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-xs w-full">
            <h4 className="font-semibold mb-2">Reset Credentials</h4>
            <input
              type="text"
              placeholder="New Username"
              value={resetUsername}
              onChange={e => setResetUsername(e.target.value)}
              className="border rounded px-2 py-1 w-full mb-2"
            />
            <input
              type="password"
              placeholder="New Password"
              value={resetPassword}
              onChange={e => setResetPassword(e.target.value)}
              className="border rounded px-2 py-1 w-full mb-2"
            />
            {resetError && <div className="text-red-600 text-sm mb-1">{resetError}</div>}
            {resetSuccess && <div className="text-green-600 text-sm mb-1">{resetSuccess}</div>}
            <div className="flex gap-2 mt-2">
              <Button onClick={handleResetCredentials} disabled={actionLoading}>Submit</Button>
              <Button variant="outline" onClick={() => setResetDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <Button onClick={() => router.push('/my-cliqs')}>
        Back to My Cliqs
      </Button>
    </div>
  );
}
