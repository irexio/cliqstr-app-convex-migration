'use client';

/**
 * 🔐 APA-HARDENED — Invite Landing Page
 * 
 * This page handles the invite code validation and account creation flow.
 * It receives an invite code via URL query parameter and validates it.
 * 
 * Security notes:
 * - Invite codes are validated server-side
 * - Child accounts require parental verification
 * - Adult accounts require age verification
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
  inviteType?: 'adult' | 'child';
  friendFirstName?: string;
  error?: string;
}

export default function InvitePage() {
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
        
        if (response.ok) {
          setInviteDetails({
            valid: true,
            cliqName: data.cliqName,
            inviterName: data.inviterName,
            inviteType: data.inviteType,
            friendFirstName: data.friendFirstName
          });
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
  }, [inviteCode]);

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
  if (status === 'unauthenticated') {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>You've Been Invited!</CardTitle>
            <CardDescription>
              {inviteDetails.inviteType === 'child' 
                ? `${inviteDetails.inviterName} has invited ${inviteDetails.friendFirstName} to join ${inviteDetails.cliqName}`
                : `${inviteDetails.inviterName} has invited you to join ${inviteDetails.cliqName}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">To accept this invitation, you need to sign in or create an account.</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => router.push(`/login?callbackUrl=/invite?code=${inviteCode}`)}>
              Sign In
            </Button>
            <Button className="w-full" variant="outline" onClick={() => router.push(`/register?inviteCode=${inviteCode}`)}>
              Create Account
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
            {inviteDetails.inviteType === 'child' 
              ? `${inviteDetails.inviterName} has invited ${inviteDetails.friendFirstName} to join ${inviteDetails.cliqName}`
              : `${inviteDetails.inviterName} has invited you to join ${inviteDetails.cliqName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            {inviteDetails.inviteType === 'child'
              ? `As ${inviteDetails.friendFirstName}'s parent/guardian, you can accept this invitation to ${inviteDetails.cliqName}.`
              : `You've been invited to join ${inviteDetails.cliqName}.`}
          </p>
          {inviteDetails.error && (
            <p className="text-red-500 mb-4">{inviteDetails.error}</p>
          )}
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
