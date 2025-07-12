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
  aiModerationLevel: 'strict' | 'moderate' | 'off';
  age?: number; // for local enforcement
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
    aiModerationLevel: 'strict',
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

  // ... (rest of the component logic and JSX)
  const [inviteRequiresApproval, setInviteRequiresApproval] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    // Fetch inviteRequiresApproval from ChildSettings API
    const fetchSettings = async () => {
      try {
        const res = await fetchJson(`/api/parent/child-settings/get?childId=${childId}`);
        setInviteRequiresApproval(res.inviteRequiresApproval ?? false);
      } catch (err) {
        setInviteRequiresApproval(false);
      }
    };
    fetchSettings();
  }, [childId]);

  const handleToggle = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await fetchJson('/api/parent/child-settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, inviteRequiresApproval: !inviteRequiresApproval }),
      });
      setInviteRequiresApproval(!inviteRequiresApproval);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setSaveError('Failed to save setting.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
        <div>
          <span className="font-semibold">Require my approval before my child can send invites</span>
          <p className="text-sm text-gray-500 mt-1">
            If enabled, you’ll receive an approval request via SMS (if your mobile is on file) or email whenever your child tries to invite someone.
          </p>
        </div>
        <Switch
          checked={inviteRequiresApproval}
          onChange={handleToggle}
          className={`${inviteRequiresApproval ? 'bg-blue-600' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          disabled={saving}
        >
          <span className="sr-only">Require approval for child invites</span>
          <span
            className={`${inviteRequiresApproval ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
      {saveSuccess && <div className="text-green-600">Setting saved!</div>}
      {saveError && <div className="text-red-600">{saveError}</div>}
    </div>
  );
}

