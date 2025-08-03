'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Using iron-session, NOT next-auth
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

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(!!data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Validate the invite code when the component mounts
  useEffect(() => {
    async function validateInvite() {
      if (!inviteCode) {
        setInviteDetails({ valid: false, error: 'No invite code provided' });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/invites/validate?code=${inviteCode}`);
        const data = await response.json();
        
        if (response.ok && data.valid && data.inviteRole === 'child') {
          setInviteDetails({
            valid: true,
            cliqName: data.cliqName,
            inviterName: data.inviterName,
            inviteRole: data.inviteRole,
            friendFirstName: data.friendFirstName
          });
        } else if (response.ok && data.valid && data.inviteRole === 'adult') {
          // Redirect to adult invite page if this is an adult invite
          router.push(`/invite/adult?code=${inviteCode}`);
          return;
        } else {
          setInviteDetails({ valid: false, error: data.error || 'Invalid invite code' });
        }
      } catch (error) {
        console.error('Error validating invite:', error);
        setInviteDetails({ valid: false, error: 'Failed to validate invite' });
      } finally {
        setLoading(false);
      }
    }

    validateInvite();
  }, [inviteCode, router]);

  // Handle the accept invite action
  const handleAcceptInvite = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // ✅ APA COMPLIANCE: Handle child invite response
        if (data.requiresParentApproval && data.inviteType === 'child') {
          console.log('[APA] Child invite requires parent approval - redirecting to parent approval flow');
          
          // Check user's plan status first
          const authRes = await fetch('/api/auth/status', {
            credentials: 'include',
          });
          
          if (authRes.ok) {
            const authData = await authRes.json();
            const account = authData.user?.account;
            
            // If no plan, redirect to choose-plan with context
            if (!account?.plan) {
              console.log('[APA] Parent has no plan, redirecting to choose-plan with child invite context');
              // Store invite details for after plan selection
              sessionStorage.setItem('pendingChildInvite', JSON.stringify({
                inviteCode,
                cliqName: data.cliqName,
                friendFirstName: data.friendFirstName
              }));
              router.push('/choose-plan?context=child-invite');
            } else {
              // Has plan, redirect to parent approval flow
              console.log('[APA] Parent has plan, redirecting to parent approval flow');
              router.push(`/api/parent-approval/start?code=${inviteCode}`);
            }
          } else {
            // Fallback to parent approval flow
            router.push(`/api/parent-approval/start?code=${inviteCode}`);
          }
        } else {
          // Regular adult invite - shouldn't happen on this page but handle gracefully
          console.log('[INVITE] Regular adult invite completed');
          router.push(`/cliqs/${data.cliqId}`);
        }
      } else {
        setInviteDetails(prev => ({ ...prev!, error: data.error }));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      setInviteDetails(prev => ({ ...prev!, error: 'Failed to accept invite' }));
      setLoading(false);
    }
  };

  // Show loading state while checking session and invite
  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Validating your invitation...</p>
      </div>
    );
  }

  // Show error if invite is invalid
  if (!inviteDetails?.valid) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{inviteDetails?.error || 'The invite code is invalid or has expired.'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/')}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If user is not logged in, show sign in prompt
  if (!isAuthenticated) {
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
                  Cliqstr is designed with child safety as our top priority. We require parental approval 
                  for all child accounts and provide comprehensive monitoring tools.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• All child activity is monitored and logged</li>
                  <li>• Parents can review all messages and interactions</li>
                  <li>• Safe, moderated community spaces only</li>
                  <li>• No direct messaging between children</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">👨‍👩‍👧‍👦 Adult Verification Required</h3>
                <p className="text-amber-800 text-sm">
                  To approve this invitation, you need to sign in or create an account to verify you are 
                  an adult guardian responsible for {inviteDetails.friendFirstName}.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => {
              // 🛠️ SOL'S FIX: Store invite role for plan access
              sessionStorage.setItem('parentInviteContext', JSON.stringify({ inviteCode, inviteRole: 'parent' }));
              sessionStorage.setItem('inviteRole', 'parent');
              localStorage.setItem('inviteRole', 'parent'); // Persist through page reloads
              router.push(`/sign-up?invite=${inviteCode}`);
            }}>
              Create Parent Account
            </Button>
            <Button className="w-full" variant="outline" onClick={() => {
              // 🛠️ SOL'S FIX: Store invite context AND role for redirect after sign-in
              sessionStorage.setItem('parentInviteContext', JSON.stringify({ inviteCode, inviteRole: 'parent' }));
              sessionStorage.setItem('inviteRole', 'parent');
              localStorage.setItem('inviteRole', 'parent'); // Persist through page reloads
              router.push('/sign-in');
            }}>
              Sign In as Parent/Guardian
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // User is authenticated - redirect to Parents HQ for proper APA compliance
  useEffect(() => {
    if (isAuthenticated && inviteCode) {
      console.log('[APA] Authenticated user with child invite - redirecting to Parents HQ');
      router.push(`/parents/hq?inviteCode=${inviteCode}`);
    }
  }, [isAuthenticated, inviteCode, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
          Parent/Guardian Approval
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
        <p className="text-gray-600">Redirecting to Parent Dashboard...</p>
      </div>
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
