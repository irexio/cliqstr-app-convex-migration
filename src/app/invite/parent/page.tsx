'use client';

/**
 * 🔐 APA-HARDENED — Parent Approval Invite Landing Page
 * 
 * This page handles the invite acceptance flow for child invites requiring parental approval.
 * It receives an invite code via URL query parameter and validates it.
 * 
 * Security notes:
 * - Invite codes are validated server-side
 * - Parent/guardian approval is required for child accounts
 * - Adult verification is enforced for creating child accounts
 * - All sensitive operations use proper authentication
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface InviteDetails {
  valid: boolean;
  cliqName?: string;
  inviterName?: string;
  friendFirstName?: string;
  error?: string;
}

export default function ParentInvitePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('code');
  
  const [loading, setLoading] = useState(true);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);

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
        // Redirect to the cliq page after successful acceptance
        router.push(`/cliqs/${data.cliqId}`);
      } else if (response.status === 403 && data.requiresVerification) {
        // Redirect to age verification if needed
        router.push(`/verify-age?redirectTo=/invite/parent?code=${inviteCode}`);
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
  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Validating invitation for {inviteDetails?.friendFirstName || 'your child'}...</p>
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
  if (status === 'unauthenticated') {
    return (
      <div className="container max-w-lg mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome to Cliqstr — a space built for families.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Intro:</h3>
              <p className="mb-2">
                Your child <span className="font-medium">{inviteDetails.friendFirstName}</span> has been invited by <span className="font-medium">{inviteDetails.inviterName}</span> to join a private Cliq called "{inviteDetails.cliqName}".
              </p>
              <p className="mb-2">
                Cliqstr is a private, ad-free platform designed for real-world groups, not followers or feeds.
              </p>
              <p>
                There are no ads, no tracking, and no public profiles — just real people in safe, small cliqs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Why You're Seeing This:</h3>
              <p>
                To protect your child and respect privacy laws, every child account must be approved and created by a verified parent or guardian. That means you decide what happens next.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">What Happens If You Approve:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>You'll create your child's Cliqstr account</li>
                <li>
                  You'll have access to Parent HQ, where you can:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Quietly monitor activity (read-only, not visible to child)</li>
                    <li>Set your child's nickname, username, and password</li>
                    <li>Control permissions like posting, commenting, and inviting others</li>
                    <li>Approve or deny future invites</li>
                    <li>Manage multiple children from one dashboard</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Before You Continue:</h3>
              <p className="text-blue-700">
                To confirm you're an adult, we'll ask for a credit or debit card through a secure Stripe checkout.
                Your card will never be charged without your consent.
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
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => router.push(`/login?callbackUrl=/invite/parent?code=${inviteCode}`)}>
              Approve Invite & Set Up Child Account
            </Button>
            <Button className="w-full" variant="outline" onClick={() => router.push(`/register?inviteCode=${inviteCode}&childInvite=true&fullAccess=true`)}>
              Explore Full Access to Cliqstr
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // User is authenticated, show accept invitation UI
  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to Cliqstr — a space built for families.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Intro:</h3>
            <p className="mb-2">
              Your child <span className="font-medium">{inviteDetails.friendFirstName}</span> has been invited by <span className="font-medium">{inviteDetails.inviterName}</span> to join a private Cliq called "{inviteDetails.cliqName}".
            </p>
            <p>
              Since you're already signed in, you can approve this invitation and set up your child's account right away.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">What Happens When You Approve:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>You'll create your child's Cliqstr account</li>
              <li>
                You'll have access to Parent HQ, where you can:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Quietly monitor activity (read-only, not visible to child)</li>
                  <li>Set your child's nickname, username, and password</li>
                  <li>Control permissions like posting, commenting, and inviting others</li>
                  <li>Approve or deny future invites</li>
                </ul>
              </li>
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
