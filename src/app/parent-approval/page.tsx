// 🔐 APA-HARDENED — Parent Approval Landing Page
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/PasswordInput';

// Loading fallback component
function LoadingFallback() {
  return (
    <main className="max-w-xl mx-auto p-8 text-center text-gray-700">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      <p className="mt-4">Loading approval information...</p>
    </main>
  );
}

// Main page component with Suspense boundary
export default function ParentApprovalPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ParentApprovalContent />
    </Suspense>
  );
}

// Wrapper component that uses searchParams
function ParentApprovalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [childInfo, setChildInfo] = useState<{
    firstName: string;
    lastName: string;
    age?: number | undefined;
  } | null>(null);
  const [parentEmail, setParentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const inviteCode = searchParams.get('inviteCode');
  const childId = searchParams.get('childId');
  
  // Store parent approval context in sessionStorage for sign-in redirect
  useEffect(() => {
    if (inviteCode && childId) {
      sessionStorage.setItem('parentApprovalContext', JSON.stringify({ inviteCode, childId }));
    }
  }, [inviteCode, childId]);

  useEffect(() => {
    if (!inviteCode || !childId) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }

    // Fetch child information
    const fetchChildInfo = async () => {
      try {
        const response = await fetch(`/api/parent-approval/validate?inviteCode=${inviteCode}&childId=${childId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to validate approval request');
        }

        setChildInfo(data.childInfo);
      } catch (err: any) {
        setError(err.message || 'Failed to load child information');
      } finally {
        setLoading(false);
      }
    };

    fetchChildInfo();
  }, [inviteCode, childId]);

  const handleApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/parent-approval/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode,
          childId,
          parentEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete approval');
      }

      setSuccess(true);

      // Redirect to parents-hq after a short delay
      // This ensures parents always go to parents-hq after child approval
      setTimeout(() => {
        window.location.href = '/parents/hq';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete approval');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center text-gray-700">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-4">Loading approval information...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center text-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="mb-4">{error}</p>
        <Button onClick={() => router.push('/')} variant="outline">
          Return to Home
        </Button>
      </main>
    );
  }

  if (success) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center text-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-green-600">Approval Complete!</h1>
        <p className="mb-4">
          You have successfully approved your child's account. They can now access Cliqstr.
        </p>
        <p className="mb-6">Redirecting to parent dashboard...</p>
        <Button onClick={() => router.push('/parents/hq')}>
          Click to Continue
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto p-8 text-gray-700">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Parent Approval Process</h1>
        <p className="text-gray-600">
          Choose how you'd like to proceed with your child's Cliqstr request.
        </p>
      </div>

      <div className="space-y-4">
        {/* Existing Parent Option */}
        <Button 
          onClick={() => {
            // Store parent approval context for post-login redirect
            sessionStorage.setItem('parentApprovalContext', JSON.stringify({ 
              inviteCode, 
              childId,
              redirectTo: '/parents/hq',
              action: 'child-approval'
            }));
            // Redirect to sign-in with return URL
            const signInUrl = new URL('/sign-in', window.location.origin);
            signInUrl.searchParams.set('returnTo', `/api/parent-approval/complete?inviteCode=${inviteCode}&childId=${childId}&action=approve`);
            window.location.href = signInUrl.toString();
          }}
          className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 text-white"
        >
          Sign In to Approve
        </Button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-gray-500">or</span>
          </div>
        </div>

        {/* New Parent Option */}
        <Button 
          onClick={() => {
            // Store context and redirect to account creation flow
            sessionStorage.setItem('parentApprovalContext', JSON.stringify({ 
              inviteCode, 
              childId,
              redirectTo: '/parents/hq',
              action: 'child-approval'
            }));
            // Show the account creation form
            setShowAccountForm(true);
          }}
          className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          Complete Parent/Guardian Setup
        </Button>
      </div>

      {/* Account Creation Form - Only shown when needed */}
      {showAccountForm && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Create Your Parent Account</h3>
          
          <form onSubmit={handleApproval} className="space-y-4">
            <div>
              <Label htmlFor="parentEmail">Your Email</Label>
              <Input
                id="parentEmail"
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Create Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAccountForm(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create & Approve'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <p className="mt-8 text-sm text-center text-gray-500">
        By proceeding, you consent to your child using Cliqstr under your supervision.
      </p>
    </main>
  );
}
