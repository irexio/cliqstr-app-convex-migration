'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const dynamic = 'force-dynamic';

interface InviteDetails {
  valid: boolean;
  cliqName?: string;
  inviterName?: string;
  inviteRole?: string;
  friendFirstName?: string;
  error?: string;
}

function ParentInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('code');

  const [loading, setLoading] = useState(true);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // 1. Check authentication
  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setIsAuthenticated(!!data?.user))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setAuthLoading(false));
  }, []);

  // 2. Validate the invite
  useEffect(() => {
    if (!inviteCode) {
      setInviteDetails({ valid: false, error: 'No invite code provided' });
      setLoading(false);
      return;
    }

    fetch(`/api/invites/validate?code=${inviteCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid && data.inviteRole === 'child') {
          setInviteDetails({
            valid: true,
            cliqName: data.cliqName,
            inviterName: data.inviterName,
            inviteRole: data.inviteRole,
            friendFirstName: data.friendFirstName
          });
        } else {
          router.push(`/invite/adult?code=${inviteCode}&error=invalid`);
        }
      })
      .catch(() => {
        setInviteDetails({ valid: false, error: 'Failed to validate invite' });
      })
      .finally(() => setLoading(false));
  }, [inviteCode, router]);

  // 3. If already authenticated, go to Parents HQ
  useEffect(() => {
    if (isAuthenticated && inviteCode) {
      router.push(`/parents/hq?inviteCode=${inviteCode}`);
    }
  }, [isAuthenticated, inviteCode, router]);

  // 4. UI - not logged in
  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Validating your invitation...</p>
      </div>
    );
  }

  if (!inviteDetails?.valid) {
    return <div className="text-red-600">Invalid or expired invite.</div>;
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Child Invitation - Parent Approval Required</CardTitle>
          <CardDescription>
            {inviteDetails.inviterName} has invited {inviteDetails.friendFirstName} to join {inviteDetails.cliqName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🛡️ Child Safety First</h3>
              <p className="text-blue-800 text-sm mb-3">
                Cliqstr is designed with child safety as our top priority. Parental approval and monitoring tools are required for all child accounts.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">👨‍👩‍👧‍👦 Choose How You Want to Join</h3>
              <p className="text-amber-800 text-sm">
                You can either create a free parent account just for this invite — or create a full parent dashboard.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => router.push(`/sign-up?invite=${inviteCode}`)}>
            Create Parent Account
          </Button>
          <Button className="w-full" variant="outline" onClick={() => router.push('/sign-in')}>
            Sign In as Parent/Guardian
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ParentInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading invitation...</p>
      </div>
    }>
      <ParentInviteContent />
    </Suspense>
  );
}
