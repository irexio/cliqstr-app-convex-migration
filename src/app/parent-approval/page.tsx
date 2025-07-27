// 🔐 APA-HARDENED — Parent Approval Landing Page
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <main className="max-w-xl mx-auto p-8 text-gray-700">
      <h1 className="text-2xl font-bold mb-4 text-center">Parent Approval</h1>

      {childInfo && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Child Information</h2>
          <p><strong>Name:</strong> {childInfo.firstName} {childInfo.lastName}</p>
          {childInfo.age && <p><strong>Age:</strong> {childInfo.age}</p>}
          <p className="mt-2 text-sm text-blue-700">
            Your child is requesting to join Cliqstr, a safe and private space to connect with close family and friends.
          </p>
        </div>
      )}

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
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : 'Approve Account'}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-center text-neutral-500">
        By approving this account, you consent to your child using Cliqstr under your supervision.
        A free test plan will be automatically applied with no payment required.
      </p>
    </main>
  );
}
