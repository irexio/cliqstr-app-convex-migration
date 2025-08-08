"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ParentDashboard from './ParentDashboard';
import ChildInviteApprovalFlow from './ChildInviteApprovalFlow';

type InviteStatus = 'valid' | 'used' | 'invalid' | 'loading';

export default function ParentsHQContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('inviteCode')?.trim() || '';
  const router = useRouter();

  const [status, setStatus] = useState<InviteStatus>('loading');
  const [authLoading, setAuthLoading] = useState(true);

  // 1) Auth gate: require login, allow Adult or Parent, block Child
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = res.ok ? await res.json() : null;

        if (!data?.user) {
          const rt = `/parents/hq${inviteCode ? `?inviteCode=${encodeURIComponent(inviteCode)}` : ''}`;
          router.replace(`/sign-in?returnTo=${encodeURIComponent(rt)}`);
          return;
        }

        // Block children from HQ
        if (data.user.role === 'Child') {
          router.replace('/awaiting-approval');
          return;
        }
      } catch (err) {
        console.error('[PARENTS_HQ] auth check failed:', err);
        const rt = `/parents/hq${inviteCode ? `?inviteCode=${encodeURIComponent(inviteCode)}` : ''}`;
        router.replace(`/sign-in?returnTo=${encodeURIComponent(rt)}`);
        return;
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    checkAuth();

    // Re-check when tab regains focus (avoids stale session)
    const vis = () => {
      if (!document.hidden) {
        setAuthLoading(true);
        checkAuth();
      }
    };
    document.addEventListener('visibilitychange', vis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', vis);
    };
  }, [inviteCode, router]);

  // 2) Invite validation (only when inviteCode present)
  useEffect(() => {
    let cancelled = false;

    async function validateInvite() {
      if (!inviteCode) {
        setStatus('valid'); // No invite → show dashboard
        return;
      }
      setStatus('loading');

      try {
        const res = await fetch(`/api/invites/validate?code=${encodeURIComponent(inviteCode)}`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        const data = await res.json();

        if (!res.ok) {
          // Prefer explicit reason if present
          if (data?.reason === 'used') {
            if (!cancelled) setStatus('used');
          } else {
            if (!cancelled) setStatus('invalid');
          }
          return;
        }

        if (data?.valid) {
          if (!cancelled) setStatus('valid');
        } else if (data?.reason === 'used') {
          if (!cancelled) setStatus('used');
        } else {
          if (!cancelled) setStatus('invalid');
        }
      } catch (err) {
        console.error('[PARENTS_HQ] invite validate failed:', err);
        if (!cancelled) setStatus('invalid');
      }
    }

    validateInvite();
    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  // 3) Loading states
  if (authLoading || status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking your access…</p>
      </main>
    );
  }

  // 4) Invite error states (only apply when inviteCode present)
  if (inviteCode && status === 'used') {
    return (
      <main className="min-h-screen flex items-center justify-center text-center text-gray-600">
        <div>
          <h1 className="text-xl font-bold text-red-600">Invite Already Used</h1>
          <p className="mt-2">This invitation has already been accepted. If you believe this is an error, please contact support.</p>
        </div>
      </main>
    );
  }

  if (inviteCode && status === 'invalid') {
    return (
      <main className="min-h-screen flex items-center justify-center text-center text-gray-600">
        <div>
          <h1 className="text-xl font-bold text-red-600">Invalid or Expired Invitation</h1>
          <p className="mt-2">This invite link is no longer valid. Please request a new invite from the sender.</p>
        </div>
      </main>
    );
  }

  // 5) Happy paths
  if (inviteCode && status === 'valid') {
    // Child invite approval flow
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🛡️ Parents HQ</h1>
          <p className="text-gray-600">Child Invite Approval</p>
        </div>
        <ChildInviteApprovalFlow inviteCode={inviteCode} />
      </div>
    );
  }

  // Default: Parent dashboard (ongoing child management)
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">🛡️ Parents HQ</h1>
        <p className="text-gray-600 mt-2">Comprehensive child management and safety controls</p>
        <p className="text-sm text-blue-600">Every child on Cliqstr requires parent approval through this interface</p>
      </div>
      <ParentDashboard />
    </div>
  );
}
