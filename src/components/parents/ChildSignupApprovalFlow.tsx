'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordInput from '@/components/ui/PasswordInput';

interface ApprovalDetails {
  childFirstName: string;
  childLastName: string;
  childBirthdate: string;
  parentEmail: string;
  context: string;
}

interface ChildSignupApprovalFlowProps {
  approvalToken: string;
}

/**
 * 🔐 APA-HARDENED COMPONENT: Parent HQ - Child Signup Approval Flow
 * 
 * Purpose:
 *   - PARENT HQ: Complete child permission setup interface for direct signups
 *   - Fetches approval details and shows child info
 *   - Collects ALL required parent permissions and settings
 *   - Creates child account only after FULL Parent HQ approval
 * 
 * Critical: 
 *   - This IS the Parent HQ for child signup approval
 *   - Every child MUST have parents complete these permissions
 *   - Approval is NOT marked as completed until final Parent HQ approval
 */
export default function ChildSignupApprovalFlow({ approvalToken }: ChildSignupApprovalFlowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [approvalDetails, setApprovalDetails] = useState<ApprovalDetails | null>(null);
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [redAlertAccepted, setRedAlertAccepted] = useState(false);
  const [silentMonitoring, setSilentMonitoring] = useState(true);
  const [permissions, setPermissions] = useState({
    canCreateCliqs: false,
    canInviteChildren: false,
    canInviteAdults: false,
    canCreatePublicCliqs: false,
    canJoinAgeAppropriatePublicCliqs: false
  });

  // Fetch approval details
  useEffect(() => {
    const fetchApprovalDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/parent-approval/check?token=${encodeURIComponent(approvalToken)}`,
          { cache: 'no-store' }
        );
        const data = await response.json();

        if (!response.ok || !data.approval) {
          throw new Error('Failed to load approval details');
        }

        setApprovalDetails({
          childFirstName: data.approval.childFirstName,
          childLastName: data.approval.childLastName,
          childBirthdate: data.approval.childBirthdate,
          parentEmail: data.approval.parentEmail,
          context: data.approval.context,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load approval details');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalDetails();
  }, [approvalToken]);

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
      // Log start
      console.log('[PARENTS_HQ][signup-approval] start', { token: approvalToken, username, perms: permissions });

      const response = await fetch('/api/parent/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalToken: approvalToken,
          firstName: approvalDetails?.childFirstName,
          lastName: approvalDetails?.childLastName,
          birthdate: approvalDetails?.childBirthdate,
          username: username.trim(),
          password,
          silentMonitoring,
          permissions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const reason = data?.error || 'server_error';
        console.warn('[PARENTS_HQ][signup-approval] failure', { reason });
        setError(reason);
        setSubmitting(false);
        return;
      }

      // Success - redirect to success page
      console.log('[PARENTS_HQ][signup-approval] success');
      router.replace(`/parents/hq/success?childName=${encodeURIComponent(approvalDetails?.childFirstName || '')}`);
      
    } catch (err: any) {
      console.error('[PARENTS_HQ][signup-approval] error', err);
      setError(err.message || 'Failed to complete approval');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p className="ml-3 text-gray-600">Loading approval details...</p>
      </div>
    );
  }

  if (error && !approvalDetails) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800 font-medium">Error Loading Approval</p>
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

  const childName = `${approvalDetails?.childFirstName} ${approvalDetails?.childLastName}`;
  const childAge = approvalDetails?.childBirthdate 
    ? new Date().getFullYear() - new Date(approvalDetails.childBirthdate).getFullYear()
    : null;

  return (
    <div className="space-y-6">
      {/* Parent HQ Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">🛡️ Parent HQ - Child Permission Setup</CardTitle>
          <p className="text-blue-700 text-sm">Every child must have parents complete these permissions before account creation</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-800">
            <p><strong>Child:</strong> {childName}</p>
            {childAge && <p><strong>Age:</strong> {childAge} years old</p>}
            <p><strong>Request Type:</strong> Direct Signup</p>
            <p><strong>Context:</strong> {approvalDetails?.context}</p>
          </div>
        </CardContent>
      </Card>

      {/* Red Alert Agreement */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">🚨 Red Alert System - Critical Safety Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-red-800 text-sm">
              <strong>Red Alert System:</strong> When a Red Alert is pressed, the post is immediately suspended, 
              AI moderation and parents are both instantly notified. This is a critical safety feature.
            </p>
            <p className="text-red-800 text-sm">
              By approving this signup, you understand that {approvalDetails?.childFirstName}'s activity 
              will be monitored for safety and you will receive instant alerts for any concerning behavior.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="redAlert"
                checked={redAlertAccepted}
                onCheckedChange={(checked) => setRedAlertAccepted(checked as boolean)}
              />
              <Label htmlFor="redAlert" className="text-red-800 font-medium">
                I understand the Red Alert system is critical for {approvalDetails?.childFirstName}'s safety
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
              <Label htmlFor="username">Username for {approvalDetails?.childFirstName}</Label>
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
                Monitor {approvalDetails?.childFirstName}'s activity without them knowing
              </p>
            </div>

            {/* Parent HQ: Child Permissions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">🛡️ Parent HQ: Set Permissions for {approvalDetails?.childFirstName}</h4>
              <p className="text-gray-600 text-xs mb-3">Select which features you want activated on your child's account</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canCreateCliqs"
                    checked={permissions.canCreateCliqs}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, canCreateCliqs: checked as boolean }))
                    }
                  />
                  <Label htmlFor="canCreateCliqs" className="text-sm">
                    Can create cliqs
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canInviteChildren"
                    checked={permissions.canInviteChildren}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, canInviteChildren: checked as boolean }))
                    }
                  />
                  <Label htmlFor="canInviteChildren" className="text-sm">
                    Can invite children
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canInviteAdults"
                    checked={permissions.canInviteAdults}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, canInviteAdults: checked as boolean }))
                    }
                  />
                  <Label htmlFor="canInviteAdults" className="text-sm">
                    Can invite adults
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canCreatePublicCliqs"
                    checked={permissions.canCreatePublicCliqs}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, canCreatePublicCliqs: checked as boolean }))
                    }
                  />
                  <Label htmlFor="canCreatePublicCliqs" className="text-sm">
                    Can create public cliqs
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canJoinAgeAppropriatePublicCliqs"
                    checked={permissions.canJoinAgeAppropriatePublicCliqs}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, canJoinAgeAppropriatePublicCliqs: checked as boolean }))
                    }
                  />
                  <Label htmlFor="canJoinAgeAppropriatePublicCliqs" className="text-sm">
                    Can join age appropriate public cliqs
                  </Label>
                </div>
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
                {submitting ? 'Creating Account...' : `🛡️ Parent HQ: Complete Setup for ${approvalDetails?.childFirstName}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
