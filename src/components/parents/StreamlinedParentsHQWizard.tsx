'use client';

/**
 * 🔐 APA-HARDENED COMPONENT: Streamlined Parents HQ Wizard
 * 
 * Purpose:
 *   - Single comprehensive step for child setup
 *   - Two-tier permission system: Regular vs Invited children
 *   - Supports dropdown for additional children
 *   - Clean, simple flow for invited parents
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ChildPermissions {
  canPost: boolean;
  canComment: boolean;
  canInviteFriends: boolean;
  canJoinNewCliqs: boolean;
  canCreateCliqs: boolean;
  canUploadImages: boolean;
  canUploadVideos: boolean;
  canPlayGames: boolean;
}

interface ExistingChild {
  id: string;
  firstName: string;
  username: string;
}

const REGULAR_CHILD_DEFAULTS: ChildPermissions = {
  canPost: true,
  canComment: true,
  canInviteFriends: true,
  canJoinNewCliqs: true,
  canCreateCliqs: true,
  canUploadImages: true,
  canUploadVideos: true,
  canPlayGames: true,
};

const INVITED_CHILD_PERMISSIONS: ChildPermissions = {
  canPost: true,
  canComment: true,
  canInviteFriends: false,    // 🔒 Locked
  canJoinNewCliqs: false,     // 🔒 Locked
  canCreateCliqs: false,      // 🔒 Locked
  canUploadImages: true,
  canUploadVideos: false,     // 🔒 Locked
  canPlayGames: true,
};

export default function StreamlinedParentsHQWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('inviteCode');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // User and invite data
  const [userData, setUserData] = useState<any>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [existingChildren, setExistingChildren] = useState<ExistingChild[]>([]);
  
  // Form state
  const [selectedChildId, setSelectedChildId] = useState<string>('new');
  const [childFirstName, setChildFirstName] = useState('');
  const [childUsername, setChildUsername] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [permissions, setPermissions] = useState<ChildPermissions>(REGULAR_CHILD_DEFAULTS);
  
  const isInvitedChild = Boolean(inviteCode && inviteDetails);

  // Initialize wizard
  useEffect(() => {
    async function initialize() {
      try {
        // Check authentication
        const authRes = await fetch('/api/auth/status');
        const authData = await authRes.json();
        
        if (!authRes.ok || !authData.user) {
          router.push('/sign-in');
          return;
        }

        if (authData.user.role !== 'Parent') {
          router.push('/awaiting-approval');
          return;
        }

        setUserData(authData.user);

        // Load existing children
        const childrenRes = await fetch('/api/parent/children');
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setExistingChildren(childrenData.children || []);
        }

        // If there's an invite code, validate it and pre-fill child name
        if (inviteCode) {
          const inviteRes = await fetch(`/api/invites/validate?code=${encodeURIComponent(inviteCode)}`);
          if (inviteRes.ok) {
            const inviteData = await inviteRes.json();
            if (inviteData.valid && inviteData.friendFirstName) {
              setInviteDetails(inviteData);
              setChildFirstName(inviteData.friendFirstName);
              // Set invited child permissions (locked)
              setPermissions(INVITED_CHILD_PERMISSIONS);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load wizard. Please refresh and try again.');
        setLoading(false);
      }
    }

    initialize();
  }, [inviteCode, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (selectedChildId === 'new') {
        // Create new child
        if (!childFirstName.trim() || !childUsername.trim() || !childPassword.trim()) {
          throw new Error('Please fill in all child account fields.');
        }

        if (childPassword.length < 6) {
          throw new Error('Child password must be at least 6 characters.');
        }

        const createRes = await fetch('/api/parent/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: childFirstName.trim(),
            username: childUsername.trim(),
            password: childPassword,
            permissions,
            inviteCode: inviteCode || undefined,
            isInvitedChild: isInvitedChild,
          }),
        });

        if (!createRes.ok) {
          const errorData = await createRes.json();
          throw new Error(errorData.message || 'Failed to create child account.');
        }

        setSuccess(true);
        
        // If this was from an invite, accept the invite
        if (inviteCode) {
          try {
            await fetch('/api/accept-invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: inviteCode }),
            });
          } catch (err) {
            console.warn('Failed to accept invite (non-fatal):', err);
          }
        }

        // Redirect to success or dashboard
        setTimeout(() => {
          router.push('/parents/hq/dashboard');
        }, 2000);

      } else {
        // Update existing child permissions
        const updateRes = await fetch(`/api/parent/children/${selectedChildId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions }),
        });

        if (!updateRes.ok) {
          throw new Error('Failed to update child permissions.');
        }

        // If this was from an invite, accept it for the existing child
        if (inviteCode) {
          try {
            await fetch('/api/accept-invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                code: inviteCode,
                childId: selectedChildId 
              }),
            });
          } catch (err) {
            console.warn('Failed to accept invite (non-fatal):', err);
          }
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/parents/hq/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  const updatePermission = (key: keyof ChildPermissions, value: boolean) => {
    // Don't allow changes to locked permissions for invited children
    if (isInvitedChild) {
      const lockedPermissions = ['canInviteFriends', 'canJoinNewCliqs', 'canCreateCliqs', 'canUploadVideos'];
      if (lockedPermissions.includes(key)) {
        return; // Ignore attempts to change locked permissions
      }
    }
    
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading Parents HQ...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-xl font-semibold text-green-800 mb-2">
            {selectedChildId === 'new' ? 'Child Account Created!' : 'Permissions Updated!'}
          </h1>
          <p className="text-green-600 mb-4">
            {inviteCode 
              ? `${childFirstName} can now join ${inviteDetails?.cliqName || 'the Cliq'} safely!`
              : 'You can now manage your child\'s account.'}
          </p>
          <LoadingSpinner size="sm" />
          <p className="text-sm text-green-600 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Parents HQ
            </h1>
            {isInvitedChild ? (
              <div>
                <p className="text-gray-600 mb-2">
                  Setting up <strong>{inviteDetails?.friendFirstName}</strong>'s account
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  📧 Invited to join: <strong>{inviteDetails?.cliqName || 'Cliq'}</strong>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Create and manage your child's account and safety permissions
              </p>
            )}
          </div>

          {/* Child Selection (only show if not invited child and has existing children) */}
          {!isInvitedChild && existingChildren.length > 0 && (
            <div className="mb-6">
              <Label htmlFor="childSelect">Select Child</Label>
              <select
                id="childSelect"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="new">+ Create New Child Account</option>
                {existingChildren.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} (@{child.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child Account Creation (only for new children) */}
            {selectedChildId === 'new' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👶 Child Account Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="childFirstName">Child's First Name *</Label>
                    <Input
                      id="childFirstName"
                      type="text"
                      value={childFirstName}
                      onChange={(e) => setChildFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                      disabled={submitting || isInvitedChild} // Lock for invited children
                      className={`mt-1 ${isInvitedChild ? 'bg-gray-100' : ''}`}
                    />
                    {isInvitedChild && (
                      <p className="text-xs text-gray-500 mt-1">
                        🔒 Name from invitation (locked)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="childUsername">Username *</Label>
                    <Input
                      id="childUsername"
                      type="text"
                      value={childUsername}
                      onChange={(e) => setChildUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="username123"
                      required
                      disabled={submitting}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Letters and numbers only, automatically lowercase
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="childPassword">Child's Password *</Label>
                  <Input
                    id="childPassword"
                    type="password"
                    value={childPassword}
                    onChange={(e) => setChildPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    disabled={submitting}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Safety Permissions */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  🛡️ Safety Permissions
                </h3>
                {isInvitedChild && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Invited Child Safety Mode
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Content & Communication</h4>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canPost}
                      onChange={(e) => updatePermission('canPost', e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Can post content</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canComment}
                      onChange={(e) => updatePermission('canComment', e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Can comment on posts</span>
                  </label>

                  <label className={`flex items-center gap-3 ${isInvitedChild ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={permissions.canInviteFriends}
                      onChange={(e) => updatePermission('canInviteFriends', e.target.checked)}
                      disabled={submitting || isInvitedChild}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      Can invite friends
                      {isInvitedChild && <span className="text-xs">🔒</span>}
                    </span>
                  </label>
                </div>

                {/* Advanced Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Cliq Management</h4>
                  
                  <label className={`flex items-center gap-3 ${isInvitedChild ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={permissions.canJoinNewCliqs}
                      onChange={(e) => updatePermission('canJoinNewCliqs', e.target.checked)}
                      disabled={submitting || isInvitedChild}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      Can join new Cliqs
                      {isInvitedChild && <span className="text-xs">🔒</span>}
                    </span>
                  </label>

                  <label className={`flex items-center gap-3 ${isInvitedChild ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={permissions.canCreateCliqs}
                      onChange={(e) => updatePermission('canCreateCliqs', e.target.checked)}
                      disabled={submitting || isInvitedChild}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      Can create Cliqs
                      {isInvitedChild && <span className="text-xs">🔒</span>}
                    </span>
                  </label>
                </div>

                {/* Media Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Media & Games</h4>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canUploadImages}
                      onChange={(e) => updatePermission('canUploadImages', e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Can upload images</span>
                  </label>

                  <label className={`flex items-center gap-3 ${isInvitedChild ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={permissions.canUploadVideos}
                      onChange={(e) => updatePermission('canUploadVideos', e.target.checked)}
                      disabled={submitting || isInvitedChild}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      Can upload videos
                      {isInvitedChild && <span className="text-xs">🔒</span>}
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canPlayGames}
                      onChange={(e) => updatePermission('canPlayGames', e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Can play games</span>
                  </label>
                </div>
              </div>

              {/* Invited Child Explanation */}
              {isInvitedChild && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-800">
                    <strong>🔒 Invited Child Safety:</strong> Some permissions are locked for invited children to ensure safer participation. Your child can only join the Cliq they were invited to and cannot invite others or upload videos.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  {selectedChildId === 'new' ? 'Creating Account...' : 'Updating Permissions...'}
                </span>
              ) : (
                selectedChildId === 'new' 
                  ? (isInvitedChild ? `Create ${childFirstName}'s Account & Join Cliq` : 'Create Child Account')
                  : 'Update Permissions'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
