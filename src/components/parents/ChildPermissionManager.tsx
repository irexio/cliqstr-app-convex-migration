'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * 🛡️ PARENT HQ - Child Permission Manager
 * 
 * Comprehensive permission management for individual children.
 * This is part of the main Parent HQ interface.
 */

interface ChildSettings {
  canCreatePublicCliqs: boolean;
  canJoinPublicCliqs: boolean;
  canCreateCliqs: boolean;
  canSendInvites: boolean;
  canInviteChildren: boolean;
  canInviteAdults: boolean;
  isSilentlyMonitored: boolean;
  canAccessGames: boolean;
  canPostImages: boolean;
  canShareYouTube: boolean;
  inviteRequiresApproval: boolean;
}

interface ChildInfo {
  id: string;
  username?: string;
  email?: string;
  settings: ChildSettings;
}

interface ChildPermissionManagerProps {
  childId: string;
}

export default function ChildPermissionManager({ childId }: ChildPermissionManagerProps) {
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCredentialUpdate, setShowCredentialUpdate] = useState(false);

  useEffect(() => {
    const fetchChildInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/parent/children/${childId}`);
        if (!response.ok) throw new Error('Failed to fetch child info');
        const data = await response.json();
        setChildInfo(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load child information');
      } finally {
        setLoading(false);
      }
    };

    fetchChildInfo();
  }, [childId]);

  const handlePermissionChange = (permission: keyof ChildSettings, value: boolean) => {
    if (!childInfo) return;
    
    setChildInfo(prev => ({
      ...prev!,
      settings: {
        ...prev!.settings,
        [permission]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    if (!childInfo) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/parent/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: childInfo.id,
          settings: childInfo.settings
        })
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!newUsername || !newPassword) {
      alert('Please enter both username and password');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/parent/child-credentials/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          username: newUsername,
          password: newPassword
        })
      });
      
      if (!response.ok) throw new Error('Failed to update credentials');
      
      setNewUsername('');
      setNewPassword('');
      setShowCredentialUpdate(false);
      alert('Credentials updated successfully!');
    } catch (err: any) {
      alert('Failed to update credentials: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Loading child information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg border border-red-200">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!childInfo) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Child not found</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Child Info Header */}
      <Card>
        <CardHeader>
          <CardTitle>🛡️ Parent HQ: Managing {childInfo.username || childInfo.email || 'Child'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowCredentialUpdate(!showCredentialUpdate)}
              variant="outline"
            >
              {showCredentialUpdate ? 'Cancel' : 'Update Username/Password'}
            </Button>
          </div>
          
          {showCredentialUpdate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <Label htmlFor="newUsername">New Username</Label>
                <Input
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <Button onClick={handleUpdateCredentials} disabled={saving}>
                {saving ? 'Updating...' : 'Update Credentials'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cliq Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Cliq Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canCreatePublicCliqs"
              checked={childInfo.settings.canCreatePublicCliqs}
              onCheckedChange={(checked) => handlePermissionChange('canCreatePublicCliqs', checked as boolean)}
            />
            <Label htmlFor="canCreatePublicCliqs">Can create public cliqs</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canCreateCliqs"
              checked={childInfo.settings.canCreateCliqs}
              onCheckedChange={(checked) => handlePermissionChange('canCreateCliqs', checked as boolean)}
            />
            <Label htmlFor="canCreateCliqs">Can create private cliqs</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canJoinPublicCliqs"
              checked={childInfo.settings.canJoinPublicCliqs}
              onCheckedChange={(checked) => handlePermissionChange('canJoinPublicCliqs', checked as boolean)}
            />
            <Label htmlFor="canJoinPublicCliqs">Can join public cliqs</Label>
          </div>
        </CardContent>
      </Card>

      {/* Invite Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canInviteChildren"
              checked={childInfo.settings.canInviteChildren}
              onCheckedChange={(checked) => handlePermissionChange('canInviteChildren', checked as boolean)}
            />
            <Label htmlFor="canInviteChildren">Can invite other children</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canInviteAdults"
              checked={childInfo.settings.canInviteAdults}
              onCheckedChange={(checked) => handlePermissionChange('canInviteAdults', checked as boolean)}
            />
            <Label htmlFor="canInviteAdults">Can invite adults</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canSendInvites"
              checked={childInfo.settings.canSendInvites}
              onCheckedChange={(checked) => handlePermissionChange('canSendInvites', checked as boolean)}
            />
            <Label htmlFor="canSendInvites">Can send invites generally</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inviteRequiresApproval"
              checked={childInfo.settings.inviteRequiresApproval}
              onCheckedChange={(checked) => handlePermissionChange('inviteRequiresApproval', checked as boolean)}
            />
            <Label htmlFor="inviteRequiresApproval">All invites require parent approval</Label>
          </div>
        </CardContent>
      </Card>

      {/* Content & Activity Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Content & Activity Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canPostImages"
              checked={childInfo.settings.canPostImages}
              onCheckedChange={(checked) => handlePermissionChange('canPostImages', checked as boolean)}
            />
            <Label htmlFor="canPostImages">Can upload and post images</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canShareYouTube"
              checked={childInfo.settings.canShareYouTube}
              onCheckedChange={(checked) => handlePermissionChange('canShareYouTube', checked as boolean)}
            />
            <Label htmlFor="canShareYouTube">Can share YouTube videos</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canAccessGames"
              checked={childInfo.settings.canAccessGames}
              onCheckedChange={(checked) => handlePermissionChange('canAccessGames', checked as boolean)}
            />
            <Label htmlFor="canAccessGames">Can access games</Label>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring & Safety */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring & Safety</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSilentlyMonitored"
              checked={childInfo.settings.isSilentlyMonitored}
              onCheckedChange={(checked) => handlePermissionChange('isSilentlyMonitored', checked as boolean)}
            />
            <Label htmlFor="isSilentlyMonitored">Enable silent monitoring (recommended)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
            {saving ? 'Saving...' : '🛡️ Save All Permission Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
