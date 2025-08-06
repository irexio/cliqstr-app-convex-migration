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
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔒 Validate invite on mount
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
          router.push(`/invite/invalid`);
        }
      })
      .catch(() => {
        setInviteDetails({ valid: false, error: 'Failed to validate invite' });
      })
      .finally(() => setLoading(false));
  }, [inviteCode, router]);

  // 🧠 Role-based redirect logic
  const handleAuthenticatedUser = async (user: any) => {
    if (!inviteCode) return;

    console.log('[PARENT_INVITE] Authenticated user:', {
      role: user.role,
      plan: user.account?.plan,
      email: user.email
    });

    if (user.role === 'Parent') {
      router.push(`/parents/hq?inviteCode=${inviteCode}`);
      return;
    }

    if (user.role === 'Adult' && user.account?.plan && user.account.plan !== 'free') {
      try {
        const response = await fetch('/api/auth/upgrade-to-parent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode })
        });

        if (response.ok) {
          router.push(`/parents/hq?inviteCode=${inviteCode}`);
        } else {
          router.push(`/choose-plan?context=child-invite&inviteCode=${inviteCode}`);
        }
      } catch (err) {
        console.error('[PARENT_INVITE] Upgrade error:', err);
        router.push(`/choose-plan?context=child-invite&inviteCode=${inviteCode}`);
      }
      return;
    }

    if (user.role === 'Adult') {
      router.push(`/parents/hq?inviteCode=${inviteCode}`);
      return;
    }

    if (user.role === 'Child') {
      // Block child account — force sign out
      await fetch('/api/auth/sign-out', { method: 'POST' });
      router.push(`/invite/invalid?reason=child-role`);
      return;
    }
  };

  // 🔍 Check auth status
  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setIsAuthenticated(true);
          handleAuthenticatedUser(data.user);
        } else {
          setIsAuthenticated(false);
          router.push(`/invite/parent/signup?inviteCode=${inviteCode}`);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        router.push(`/invite/parent/signup?inviteCode=${inviteCode}`);
      })
      .finally(() => setAuthLoading(false));
  }, [inviteCode]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Validating your invitation...</p>
      </div>
    );
  }

  if (!inviteDetails?.valid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600">Invalid or expired invite.</p>
      </div>
    );
  }

  // 🚫 If session is valid, no need to render fallback UI
  if (isAuthenticated) {
    return null;
  }

  // 🧾 If unauthenticated, show manual sign-up prompt
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
