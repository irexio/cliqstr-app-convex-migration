'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ParentDashboard from './ParentDashboard';
import ChildInviteApprovalFlow from './ChildInviteApprovalFlow';

type InviteStatus = 'valid' | 'used' | 'invalid' | 'loading';

export default function ParentsHQContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('inviteCode');
  const router = useRouter();

  const [status, setStatus] = useState<InviteStatus>('loading');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Check authentication and role before allowing access
  // Re-run when URL changes (e.g., after verification redirect)
  useEffect(() => {
    const checkAuth = () => {
      fetch('/api/auth/status', { credentials: 'include' })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (!data?.user) {
            // Not authenticated - redirect to sign in
            router.push(`/sign-in?redirect=/parents/hq&inviteCode=${inviteCode}`);
            return;
          }

          if (data.user.role !== 'Parent') {
            // Not a parent - needs verification
            if (data.user.role === 'Adult' && inviteCode) {
              console.log('[PARENT_HQ] Adult user needs verification for child invite');
              setNeedsVerification(true);
            } else {
              // Redirect to appropriate flow
              router.push(`/invite/parent?code=${inviteCode}`);
            }
            return;
          }

          // Valid parent user - clear verification flag
          console.log('[PARENT_HQ] Valid parent user authenticated');
          setNeedsVerification(false);
          setUser(data.user);
        })
        .catch((err) => {
          console.error('[PARENT_HQ] Auth check failed:', err);
          router.push('/sign-in');
        })
        .finally(() => setAuthLoading(false));
    };

    checkAuth();
    
    // Also check when the page becomes visible (e.g., after redirect)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[PARENT_HQ] Page became visible, re-checking auth');
        setAuthLoading(true);
        checkAuth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [inviteCode, router]);

  useEffect(() => {
    if (!user || !inviteCode) {
      if (!inviteCode) {
        setStatus('valid'); // no invite → show dashboard
      }
      return;
    }

    // Validate the invite
    const checkInvite = async () => {
      try {
        const res = await fetch(`/api/invites/validate?code=${inviteCode}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setStatus('valid');
        } else if (data.reason === 'used') {
          setStatus('used');
        } else {
          setStatus('invalid');
        }
      } catch (err) {
        console.error('[APA] Invite validation failed:', err);
        setStatus('invalid');
      }
    };

    checkInvite();
  }, [inviteCode]);

  // Show verification required screen
  if (needsVerification) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Adult Verification Required</h2>
          <p className="text-gray-700 mb-6">
            To complete this invitation, you must verify that you are the child's parent or guardian. 
            This is required for safety and access to Parent HQ, even on our free plan.
          </p>
          <button 
            onClick={() => router.push(`/verify-parent?inviteCode=${inviteCode}`)}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Complete Verification
          </button>
        </div>
      </main>
    );
  }

  if (authLoading || status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking invite status...</p>
      </main>
    );
  }

  if (status === 'used') {
    return (
      <main className="min-h-screen flex items-center justify-center text-center text-gray-600">
        <div>
          <h1 className="text-xl font-bold text-red-600">Invite Already Used</h1>
          <p className="mt-2">This invitation has already been accepted. If you believe this is an error, please contact support.</p>
        </div>
      </main>
    );
  }

  if (status === 'invalid') {
    return (
      <main className="min-h-screen flex items-center justify-center text-center text-gray-600">
        <div>
          <h1 className="text-xl font-bold text-red-600">Invalid Invitation</h1>
          <p className="mt-2">This invite link is no longer valid. You may request a new invite from the user who sent it.</p>
        </div>
      </main>
    );
  }

  // If valid, render invite approval flow or main Parent HQ dashboard
  if (inviteCode) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🛡️ Parent HQ</h1>
          <p className="text-gray-600">Child Invite Approval</p>
        </div>
        <ChildInviteApprovalFlow inviteCode={inviteCode} />
      </div>
    );
  }

  // Main Parent HQ Dashboard
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">🛡️ Parent HQ</h1>
        <p className="text-gray-600 mt-2">Comprehensive child management and safety controls</p>
        <p className="text-sm text-blue-600">Every child on Cliqstr requires parent approval through this interface</p>
      </div>
      <ParentDashboard />
    </div>
  );
}
