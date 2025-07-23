'use client';

export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED — Invite Acceptance Page
 * 🔄 REDIRECT HELPER
 * 
 * This page handles invite acceptance redirects.
 * It receives an invite code via URL query parameter and redirects to the invite page.
 * 
 * Tags: Helper, Redirect, Internal
 * 
 * Security notes:
 * - No direct account creation happens here
 * - This is just a redirect to the main invite page where proper verification happens
 * - Invite codes are validated server-side
 */

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

function InviteAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('code');

  useEffect(() => {
    async function checkInviteType() {
      if (!inviteCode) {
        // If no code is provided, redirect to home
        router.push('/');
        return;
      }

      try {
        console.log('Validating invite code:', inviteCode);
        
        // Create a timeout promise to prevent infinite hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
        });
        
        // Race the fetch against the timeout
        const fetchPromise = fetch(`/api/validate-invite?code=${inviteCode}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache'
        });
        
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          console.error('API returned error status:', response.status);
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.valid) {
          // Redirect based on invite type
          if (data.inviteType === 'child') {
            console.log('Redirecting to parent flow');
            router.push(`/invite/parent?code=${inviteCode}`);
          } else {
            console.log('Redirecting to adult flow');
            router.push(`/invite/adult?code=${inviteCode}`);
          }
        } else {
          console.log('Invalid invite, redirecting with error');
          router.push(`/invite/adult?code=${inviteCode}&error=invalid`);
        }
      } catch (error) {
        console.error('Error checking invite type:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        // On error, show error in adult page with error param
        router.push(`/invite/adult?code=${inviteCode}&error=server`);
      }
    }

    checkInviteType();
  }, [inviteCode, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Redirecting to your invitation...</p>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading invitation...</p>
      </div>
    }>
      <InviteAcceptContent />
    </Suspense>
  );
}
