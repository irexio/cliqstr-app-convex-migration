'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { fetchJson } from '@/lib/fetchJson';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

interface LinkedChild {
  id: string;
  name: string;
  canCreatePublicCliqs: boolean;
  canSendInvites: boolean;
  canAccessGames: boolean;
  canPostImages: boolean;
  canShareYouTube: boolean;
  visibilityLevel: 'summary' | 'flagged' | 'full';
}

export default function ParentsHQPage() {
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await fetchJson('/api/parent/settings');
        if (res.children) {
          setChildren(res.children);
        }
      } catch (err: any) {
        console.error('❌ Failed to load parent settings:', err);
        setError('Could not load your children\'s settings.');
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  const handleToggle = (childId: string, field: keyof LinkedChild, value: any) => {
    setChildren(prev =>
      prev.map(child =>
        child.id === childId ? { ...child, [field]: value } : child
      )
    );
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetchJson('/api/parent/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ children }),
      });
      router.refresh();
    } catch (err: any) {
      console.error('❌ Error saving settings:', err);
      setError('There was a problem saving your preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Parent HQ</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {children.map((child) => (
        <div key={child.id} className="border border-gray-200 rounded-lg p-6 mb-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{child.name}</h2>

          <div className="space-y-4">
            {[
              ['canCreatePublicCliqs', 'Can create public cliqs'],
              ['canSendInvites', 'Can send invites'],
              ['canAccessGames', 'Can access games'],
              ['canPostImages', 'Can post images'],
              ['canShareYouTube', 'Can share YouTube links'],
            ].map(([field, label]) => (
              <div key={field} className="flex justify-between items-center">
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={child[field as keyof LinkedChild] as boolean}
                  onChange={(value) => handleToggle(child.id, field as keyof LinkedChild, value)}
                  className={`${
                    child[field as keyof LinkedChild] ? 'bg-black' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      child[field as keyof LinkedChild] ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                  />
                </Switch>
              </div>
            ))}

            <div className="flex justify-between items-center mt-6">
              <span className="text-sm font-medium">Visibility Level</span>
              <select
                value={child.visibilityLevel}
                onChange={(e) =>
                  handleToggle(child.id, 'visibilityLevel', e.target.value)
                }
                className="text-sm border rounded px-2 py-1"
              >
                <option value="summary">Summary</option>
                <option value="flagged">Flagged Posts Only</option>
                <option value="full">Full Monitoring</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <div className="text-right">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
