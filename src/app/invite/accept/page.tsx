'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

function InviteAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('code')?.trim() || '';

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // 1) Require a code
      if (!inviteCode) {
        router.replace('/invite/invalid'); // missing code
        return;
      }

      // 2) Check auth; if not signed in, bounce to sign-in with returnTo back here
      try {
        const authRes = await fetch('/api/auth/status', { credentials: 'include', cache: 'no-store' });
        const auth = authRes.ok ? await authRes.json() : null;

        if (!auth?.user) {
          const returnTo = `/invite/accept?code=${encodeURIComponent(inviteCode)}`;
          router.replace(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
      } catch {
        const returnTo = `/invite/accept?code=${encodeURIComponent(inviteCode)}`;
        router.replace(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }

      // 3) Validate invite (read-only)
      try {
        const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000));
        const req = fetch(`/api/invites/validate?code=${encodeURIComponent(inviteCode)}`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        const res = await Promise.race([req, timeout]) as Response;

        if (!res.ok) {
          router.replace('/invite/invalid');
          return;
        }

        const data = await res.json();
        if (!data?.valid || !data?.inviteRole) {
          router.replace('/invite/invalid');
          return;
        }

        const role = String(data.inviteRole).toLowerCase();

        // Uniform email verification (idempotent)
        try {
          await fetch('/api/verify-from-invite', { method: 'POST' });
        } catch (e) {
          // non-fatal; continue
          console.warn('[INVITE_ACCEPT] verify-from-invite failed (non-fatal)', e);
        }

        // 4) Branch:
        if (role === 'adult') {
          // Adult invite: accept on server, then to dashboard
          const accept = await fetch('/api/accept-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: inviteCode }),
          });

          if (!accept.ok) {
            router.replace('/invite/invalid');
            return;
          }

          if (!cancelled) router.replace('/my-cliqs-dashboard');
          return;
        }

        if (role === 'child') {
          // Child invite: go to Parents HQ with the code
          if (!cancelled) router.replace(`/parents/hq?inviteCode=${encodeURIComponent(inviteCode)}`);
          return;
        }

        // Unknown role
        router.replace('/invite/invalid');
      } catch (err) {
        console.error('[INVITE_ACCEPT] error:', err);
        router.replace('/invite/invalid');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [inviteCode, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Processing your invitation…</p>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading invitation…</p>
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  );
}
