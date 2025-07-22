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

  // Handle username and password setup for child
  const handleSetupCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setResetError('');
    setResetSuccess('');
    
    if (!resetUsername || !resetPassword) {
      setResetError('Please provide both username and password');
      setActionLoading(false);
      return;
    }
    
    try {
      await fetchJson('/api/parent/child-credentials/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          childId, 
          username: resetUsername,
          password: resetPassword 
        }),
      });
      
      setResetSuccess('Username and password set successfully! Please share these credentials with your child or help them sign in.');
      setTimeout(() => {
        setResetDialogOpen(false);
        setResetUsername('');
        setResetPassword('');
      }, 3000);
    } catch (err: any) {
      setResetError(err.message || 'Failed to update credentials');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Child Account Setup Section */}
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h2 className="text-xl font-semibold mb-2">Child Account Setup</h2>
        <p className="text-sm text-gray-700 mb-4">
          As a parent, you need to create a username and password for your child's account.
          Please share these credentials with your child or help them sign in.
        </p>
        
        <Button 
          onClick={() => setResetDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Set Up Child's Username & Password
        </Button>
      </div>

      {/* Invite Approval Settings */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
        <div>
          <span className="font-semibold">Require my approval before my child can send invites</span>
          <p className="text-sm text-gray-500 mt-1">
            If enabled, you'll receive an approval request via SMS (if your mobile is on file) or email whenever your child tries to invite someone.
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
      
      {/* Username/Password Setup Modal */}
      {resetDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Set Up Child's Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a username and password for your child. Make sure to share these credentials with your child or help them sign in.
            </p>
            
            <form onSubmit={handleSetupCredentials} className="space-y-4">
              <div>
                <label htmlFor="childUsername" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="childUsername"
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Choose a username"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="childPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="childPassword"
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Choose a password"
                  required
                />
              </div>
              
              {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
              {resetSuccess && <p className="text-green-600 text-sm">{resetSuccess}</p>}
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  type="button" 
                  onClick={() => setResetDialogOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Setting Up...' : 'Set Up Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

