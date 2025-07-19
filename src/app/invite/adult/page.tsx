'use client';

export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED — Adult Invite Landing Page
 * 
 * This page handles the invite acceptance flow for adult invites.
 * It receives an invite code via URL query parameter and validates it.
 * 
 * Security notes:
 * - Invite codes are validated server-side
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
  error?: string;
}

export default function AdultInvitePage() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status || 'loading';
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('code');
  const errorParam = searchParams?.get('error');
  
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
      <div className="container max-w-lg mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">You've been invited to join "{inviteDetails.cliqName}" on Cliqstr.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              Cliqstr is a private, ad-free social space built for real-world relationships — not followers, feeds, or algorithms.
            </p>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-center font-medium text-blue-800">
              No hawkers. No stalkers. No ads.
            </div>
            
            <p>
              You were invited by <span className="font-medium">{inviteDetails.inviterName}</span> to join the cliq "{inviteDetails.cliqName}."
            </p>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What You Can Do:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Join this cliq and participate</li>
                <li>Create your own cliqs (if you choose a plan)</li>
                <li>Join public or interest-based cliqs for adults</li>
                <li>Enjoy a quieter, ad-free social space designed for real people, real conversations, and shared interest</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What Happens Next:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create your free Cliqstr account to accept the invite</li>
                <li>After setup, you'll have the option to explore available plans to unlock cliq creation and full access features</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => router.push(`/register?inviteCode=${inviteCode}`)}>
              Join and Accept Invite
            </Button>
            <Button className="w-full" variant="outline" onClick={() => router.push('/plans')}>
              Explore Cliqstr Plans
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
          <CardTitle className="text-2xl font-bold">You've been invited to join "{inviteDetails.cliqName}" on Cliqstr.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            Welcome back! <span className="font-medium">{inviteDetails.inviterName}</span> has invited you to join "{inviteDetails.cliqName}".
          </p>
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-center font-medium text-blue-800">
            No hawkers. No stalkers. No ads.
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">What You Can Do in This Cliq:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Participate in discussions</li>
              <li>Share photos and updates with other members</li>
              <li>Connect with people who know each other in real life</li>
              <li>Enjoy a quieter, ad-free social space</li>
            </ul>
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
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Accept Invitation'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
