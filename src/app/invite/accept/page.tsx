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

      // 2) We'll check auth after we know role (adult vs child)

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

        // 4) Branch by role
        if (role === 'adult') {
          // If not authed: send to Sign Up with code and next to dashboard
          try {
            const authRes = await fetch('/api/auth/status', { credentials: 'include', cache: 'no-store' });
            const auth = authRes.ok ? await authRes.json() : null;
            if (!auth?.user) {
              const next = '/my-cliqs-dashboard';
              router.replace(`/sign-up?code=${encodeURIComponent(inviteCode)}&next=${encodeURIComponent(next)}`);
              return;
            }
          } catch {
            const next = '/my-cliqs-dashboard';
            router.replace(`/sign-up?code=${encodeURIComponent(inviteCode)}&next=${encodeURIComponent(next)}`);
            return;
          }

          // Authenticated adult: accept on server; server redirects to dashboard
          const accept = await fetch('/api/accept-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: inviteCode }),
          });

          if (!accept.ok) {
            router.replace('/invite/invalid');
            return;
          }
          return; // rely on server redirect
        }

        if (role === 'child') {
          // Child invite: Check if parent is authenticated
          try {
            const authRes = await fetch('/api/auth/status', { credentials: 'include', cache: 'no-store' });
            const auth = authRes.ok ? await authRes.json() : null;
            if (!auth?.user) {
              // For parent invites, redirect directly to Parents HQ wizard
              if (data.type === 'parent') {
                router.replace(`/parents/hq?inviteCode=${encodeURIComponent(inviteCode)}`);
              } else {
                router.replace(`/parent/signup?code=${encodeURIComponent(inviteCode)}`);
              }
              return;
            }
          } catch {
            // For parent invites, redirect directly to Parents HQ wizard
            if (data.type === 'parent') {
              router.replace(`/parents/hq?inviteCode=${encodeURIComponent(inviteCode)}`);
            } else {
              router.replace(`/parent/signup?code=${encodeURIComponent(inviteCode)}`);
            }
            return;
          }

          // Authenticated parent: send to Parents HQ with code
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
