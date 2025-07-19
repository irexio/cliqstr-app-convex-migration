'use client';

/**
 * 🔐 APA-HARDENED — Invite Acceptance Page
 * 
 * This page handles invite acceptance redirects.
 * It receives an invite code via URL query parameter and redirects to the invite page.
 * 
 * Security notes:
 * - No direct account creation happens here
 * - This is just a redirect to the main invite page where proper verification happens
 * - Invite codes are validated server-side
 */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export default function InviteAcceptPage() {
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
        // Check the invite type to determine where to redirect
        const response = await fetch(`/api/validate-invite?code=${inviteCode}`);
        const data = await response.json();
        
        if (response.ok && data.valid) {
          // Redirect based on invite type
          if (data.inviteType === 'child') {
            // Parent approval flow
            router.push(`/invite/parent?code=${inviteCode}`);
          } else {
            // Adult invite flow
            router.push(`/invite/adult?code=${inviteCode}`);
          }
        } else {
          // Invalid invite, show error in adult page with error param
          router.push(`/invite/adult?code=${inviteCode}&error=invalid`);
        }
      } catch (error) {
        console.error('Error checking invite type:', error);
        // On error, show error in adult page with error param
        router.push(`/invite/adult?code=${inviteCode}&error=invalid`);
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
