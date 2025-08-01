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

function AdultInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('code');
  const errorParam = searchParams?.get('error');
  
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
      
      // If error param is present, set error state directly
      if (errorParam === 'invalid') {
        setInviteDetails({ valid: false, error: 'Invalid or expired invite code' });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/validate-invite?code=${inviteCode}`);
        const data = await response.json();
        
        if (response.ok && data.valid && data.inviteType === 'adult') {
          setInviteDetails({
            valid: true,
            cliqName: data.cliqName,
            inviterName: data.inviterName
          });
        } else if (response.ok && data.valid && data.inviteType === 'child') {
          // Redirect to parent invite page if this is a child invite
          router.push(`/invite/parent?code=${inviteCode}`);
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
  }, [inviteCode, errorParam, router]);

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
        // Redirect to My Cliqs dashboard after successful acceptance
        router.push('/my-cliqs-dashboard');
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
            <CardTitle>You've Been Invited!</CardTitle>
            <CardDescription>
              {inviteDetails.inviterName} has invited you to join {inviteDetails.cliqName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Welcome to Cliqstr!</h3>
                <p className="text-purple-800 text-sm mb-3">
                  Cliqstr connects real people through shared interests and meaningful conversations. 
                  Join {inviteDetails.cliqName} to connect with others who share your passions.
                </p>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Safe, moderated community spaces</li>
                  <li>• Connect with real people, not bots</li>
                  <li>• Share interests and build relationships</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                To accept this invitation, you need to sign in or create an account.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => {
              // 🛠️ SOL'S FIX: Store invite role for plan access
              sessionStorage.setItem('adultInviteContext', JSON.stringify({ inviteCode, inviteRole: 'adult' }));
              sessionStorage.setItem('inviteRole', 'adult');
              localStorage.setItem('inviteRole', 'adult'); // Persist through page reloads
              router.push(`/sign-up?invite=${inviteCode}`);
            }}>
              Create Account
            </Button>
            <Button className="w-full" variant="outline" onClick={() => {
              // 🛠️ SOL'S FIX: Store invite context AND role for redirect after sign-in
              sessionStorage.setItem('adultInviteContext', JSON.stringify({ inviteCode, inviteRole: 'adult' }));
              sessionStorage.setItem('inviteRole', 'adult');
              localStorage.setItem('inviteRole', 'adult'); // Persist through page reloads
              router.push('/sign-in');
            }}>
              Sign In
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
          <CardTitle>You've Been Invited!</CardTitle>
          <CardDescription>
            {inviteDetails.inviterName} has invited you to join {inviteDetails.cliqName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Join the Conversation</h3>
              <p className="text-green-800 text-sm mb-3">
                {inviteDetails.cliqName} is a community of real people who share interests and engage in 
                meaningful conversations. You'll be able to:
              </p>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Share posts and updates with the group</li>
                <li>• Connect with like-minded individuals</li>
                <li>• Participate in discussions and activities</li>
              </ul>
            </div>
            {inviteDetails.error && (
              <p className="text-red-500 text-sm">{inviteDetails.error}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/')}>
            Decline
          </Button>
          <Button onClick={handleAcceptInvite} disabled={loading}>
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Accept Invitation'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AdultInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading invitation...</p>
      </div>
    }>
      <AdultInviteContent />
    </Suspense>
  );
}
