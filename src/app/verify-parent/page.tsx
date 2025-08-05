'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const dynamic = 'force-dynamic';

function VerifyParentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('inviteCode');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication and validate user can access this page
  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data?.user) {
          // Not authenticated - redirect to sign in
          router.push(`/sign-in?redirect=/verify-parent&inviteCode=${inviteCode}`);
          return;
        }

        if (data.user.role === 'Parent') {
          // Already a parent - redirect to Parent HQ
          router.push(`/parents/hq?inviteCode=${inviteCode}`);
          return;
        }

        if (data.user.role !== 'Adult') {
          // Not an adult - shouldn't be here
          router.push(`/invite/parent?code=${inviteCode}`);
          return;
        }

        if (data.user.account?.plan !== 'free') {
          // Has paid plan - should have been auto-upgraded
          router.push(`/parents/hq?inviteCode=${inviteCode}`);
          return;
        }

        // Valid: Adult with free plan
        setUser(data.user);
      })
      .catch((err) => {
        console.error('[VERIFY_PARENT] Auth check failed:', err);
        setError('Failed to verify authentication status');
      })
      .finally(() => setAuthLoading(false));
  }, [inviteCode, router]);

  const handleVerifyAndApprove = async () => {
    if (!inviteCode) {
      setError('Missing invite code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Success - redirect to Parent HQ
      console.log('[VERIFY_PARENT] Verification successful, redirecting to Parent HQ');
      router.push(`/parents/hq?inviteCode=${inviteCode}`);

    } catch (err: any) {
      console.error('[VERIFY_PARENT] Verification failed:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Checking your account...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            You're Approving a Child's Access to Cliqstr
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700 text-lg">
            To protect your child's safety and give you access to manage their account, we need to confirm you're their parent or legal guardian.
          </p>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <span>This verification is <strong>free</strong> and only takes a moment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <span>We use your card only to confirm adult status (no charges will be made)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✅</span>
              <span>After verifying, you'll gain access to <strong>Parent HQ</strong> to manage your child's account</span>
            </li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🛡️ Why We Verify Parents</h3>
            <p className="text-blue-800 text-sm">
              This is an APA-mandated identity verification to ensure child safety. We never charge your card - 
              we only confirm that a real adult is managing the child's account.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleVerifyAndApprove}
              disabled={loading}
              className="w-full py-3 text-lg"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify & Approve Invite'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By clicking "Verify & Approve Invite", you confirm that you are the parent or legal guardian 
            of the child being invited to Cliqstr.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyParentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading verification...</p>
      </div>
    }>
      <VerifyParentContent />
    </Suspense>
  );
}
