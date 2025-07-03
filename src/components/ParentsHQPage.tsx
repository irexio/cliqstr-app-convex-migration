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

      <Button onClick={() => router.push('/my-cliqs')}>
        Back to My Cliqs
      </Button>
    </div>
  );
}
