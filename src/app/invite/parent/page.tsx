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
  inviteType?: string;
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
        const response = await fetch(`/api/validate-invite?code=${inviteCode}`);
        const data = await response.json();
        
        if (response.ok && data.valid && data.inviteType === 'child') {
          setInviteDetails({
            valid: true,
            cliqName: data.cliqName,
            inviterName: data.inviterName,
            inviteType: data.inviteType,
            friendFirstName: data.friendFirstName
          });
        } else if (response.ok && data.valid && data.inviteType === 'adult') {
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
        // Check user's plan status first
        const authRes = await fetch('/api/auth/status', {
          credentials: 'include',
        });
        
        if (authRes.ok) {
          const authData = await authRes.json();
          const account = authData.user?.account;
          
          // If no plan, redirect to choose-plan
          if (!account?.plan) {
            console.log('[APA] Parent has no plan, redirecting to choose-plan');
            router.push('/choose-plan');
          } else {
            // Has plan, redirect to Parents HQ to set up child permissions
            console.log('[APA] Parent has plan, redirecting to parents-hq');
            router.push('/parents/hq');
          }
        } else {
          // Fallback to parents-hq if auth check fails
          router.push('/parents/hq');
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

  // User is authenticated, show accept invitation UI
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Child Invitation - Parent Approval</CardTitle>
          <CardDescription>
            {inviteDetails.inviterName} has invited {inviteDetails.friendFirstName} to join {inviteDetails.cliqName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Ready to Approve</h3>
              <p className="text-green-800 text-sm mb-3">
                You're signed in and ready to approve {inviteDetails.friendFirstName}'s invitation to join {inviteDetails.cliqName}. 
                This is a safe, moderated community space.
              </p>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• {inviteDetails.friendFirstName} will be able to participate in group discussions</li>
                <li>• All activity will be monitored and logged for safety</li>
                <li>• You can review their interactions anytime</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Child Safety Notice:</h3>
              <p className="text-blue-700">
                By accepting this invitation, you'll be creating and managing an account for {inviteDetails.friendFirstName}. 
                You'll be responsible for monitoring their activity and ensuring their safety on the platform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Choose How You'd Like to Continue:</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-3">
                <p className="font-medium">✅ Approve This Invite Only (Free)</p>
                <p className="text-gray-600 text-sm">
                  Your child will only join "{inviteDetails.cliqName}" — no ability to create cliqs or invite others.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                <p className="font-medium">🌟 Create a Full Cliqstr Account (Upgrade Option)</p>
                <p className="text-purple-600 text-sm">
                  You'll be able to create cliqs, add more children, and join public parent groups.
                </p>
              </div>
            </div>

            {inviteDetails.error && (
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <p className="text-red-600">{inviteDetails.error}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
            Decline
          </Button>
          <Button onClick={handleAcceptInvite} disabled={loading} className="flex-1">
            {loading ? <LoadingSpinner size="sm" color="white" /> : `Accept for ${inviteDetails.friendFirstName}`}
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
