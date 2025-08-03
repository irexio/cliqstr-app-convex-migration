'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordInput from '@/components/ui/PasswordInput';

interface InviteDetails {
  inviterName: string;
  friendFirstName: string;
  cliqName: string;
  childAge?: number;
}

interface ChildInviteApprovalFlowProps {
  inviteCode: string;
}

/**
 * 🔐 APA-HARDENED COMPONENT: ChildInviteApprovalFlow
 * 
 * Purpose:
 *   - Complete child invite approval interface
 *   - Fetches invite details and shows child info
 *   - Collects all required parent approvals and settings
 *   - Creates child account only after full approval
 * 
 * Critical: Invite is NOT marked as used until final approval submission
 */
export default function ChildInviteApprovalFlow({ inviteCode }: ChildInviteApprovalFlowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [redAlertAccepted, setRedAlertAccepted] = useState(false);
  const [silentMonitoring, setSilentMonitoring] = useState(true);
  const [permissions, setPermissions] = useState({
    canPost: true,
    canComment: true,
    canReact: true,
    canViewProfiles: false,
    canReceiveInvites: false
  });

  // Fetch invite details
  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/parent-approval/validate?inviteCode=${inviteCode}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invite details');
        }

        setInviteDetails({
          inviterName: data.inviterName || 'Unknown',
          friendFirstName: data.childInfo?.firstName || 'Child',
          cliqName: data.cliqName || 'Unknown Cliq',
          childAge: data.childInfo?.age
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load invite details');
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [inviteCode]);

  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!redAlertAccepted) {
      setError('You must accept the Red Alert monitoring agreement');
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/parent-approval/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode,
          username: username.trim(),
          password,
          redAlertAccepted,
          silentMonitoring,
          permissions
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete approval');
      }

      // Success - redirect to parent dashboard
      console.log('[APA] Child invite approval completed successfully');
      router.push('/parents/hq?success=child-approved');
      
    } catch (err: any) {
      setError(err.message || 'Failed to complete approval');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p className="ml-3 text-gray-600">Loading invite details...</p>
      </div>
    );
  }

  if (error && !inviteDetails) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800 font-medium">Error Loading Invite</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/parents/hq')} 
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child Invite Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Child Invite Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-800">
            <p><strong>Child:</strong> {inviteDetails?.friendFirstName}</p>
            {inviteDetails?.childAge && <p><strong>Age:</strong> {inviteDetails.childAge} years old</p>}
            <p><strong>Invited by:</strong> {inviteDetails?.inviterName}</p>
            <p><strong>To join:</strong> {inviteDetails?.cliqName}</p>
          </div>
        </CardContent>
      </Card>

      {/* Red Alert Agreement */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">🚨 Red Alert Monitoring Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-red-800 text-sm">
              By approving this invite, you agree that all of {inviteDetails?.friendFirstName}'s activity 
              will be monitored and logged for safety. You will receive alerts for any concerning behavior.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="redAlert"
                checked={redAlertAccepted}
                onCheckedChange={(checked) => setRedAlertAccepted(checked as boolean)}
              />
              <Label htmlFor="redAlert" className="text-red-800 font-medium">
                I accept full responsibility for monitoring {inviteDetails?.friendFirstName}'s activity
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Create Child Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitApproval} className="space-y-4">
            <div>
              <Label htmlFor="username">Username for {inviteDetails?.friendFirstName}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm the password"
                required
                minLength={6}
              />
            </div>

            {/* Silent Monitoring Toggle */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="silentMonitoring"
                  checked={silentMonitoring}
                  onCheckedChange={(checked) => setSilentMonitoring(checked as boolean)}
                />
                <Label htmlFor="silentMonitoring" className="font-medium">
                  Enable Silent Monitoring (Recommended)
                </Label>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Monitor {inviteDetails?.friendFirstName}'s activity without them knowing
              </p>
            </div>

            {/* Permissions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Permissions for {inviteDetails?.friendFirstName}</h4>
              <div className="space-y-2">
                {Object.entries(permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox 
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={key} className="text-sm">
                      {key === 'canPost' && 'Can create posts'}
                      {key === 'canComment' && 'Can comment on posts'}
                      {key === 'canReact' && 'Can react to posts'}
                      {key === 'canViewProfiles' && 'Can view other profiles'}
                      {key === 'canReceiveInvites' && 'Can receive invites to other cliqs'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/parents/hq')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !redAlertAccepted}
                className="flex-1"
              >
                {submitting ? 'Creating Account...' : `Approve & Create Account for ${inviteDetails?.friendFirstName}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
