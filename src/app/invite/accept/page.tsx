'use client';

export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED — Invite Acceptance Page
 * 🔄 REDIRECT HELPER
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
        console.warn('[INVITE_ACCEPT] No invite code provided. Redirecting to home.');
        router.push('/');
        return;
      }

      try {
        console.log('[INVITE_ACCEPT] Validating invite code:', inviteCode);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000);
        });

        const fetchPromise = fetch(`/api/invites/validate?code=${inviteCode}`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache',
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

        if (!response.ok) {
          console.error('[INVITE_ACCEPT] API returned error status:', response.status);
          router.push('/invite/invalid');
          return;
        }

        const data = await response.json();
        console.log('[INVITE_ACCEPT] API response data:', data);

        // 🚫 If the invite is invalid or missing role, go to fallback
        if (!data.valid || !data.inviteRole) {
          console.warn('[INVITE_ACCEPT] Invalid or missing role. Redirecting to /invite/invalid');
          router.push('/invite/invalid');
          return;
        }

        // ✅ Route by invite role
        if (data.inviteRole === 'child') {
          console.log('[INVITE_ACCEPT] Routing to parent invite flow');
          router.push(`/invite/parent?code=${inviteCode}`);
          return;
        }

        if (data.inviteRole === 'adult') {
          console.log('[INVITE_ACCEPT] Routing to adult invite flow');
          router.push(`/invite/adult?code=${inviteCode}`);
          return;
        }

        // 🚨 Fallback if role is unsupported
        console.warn('[INVITE_ACCEPT] Unknown inviteRole:', data.inviteRole);
        router.push('/invite/invalid');
      } catch (error) {
        console.error('[INVITE_ACCEPT] Error validating invite:', error);
        router.push('/invite/invalid');
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
