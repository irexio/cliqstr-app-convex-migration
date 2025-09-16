'use client';

// 🔐 APA-HARDENED — SIGN-IN FORM
// Posts to /api/sign-in, then fetches /auth/status to verify session
// Includes fallback to /api/auth/status for deployment edge cases
// Auto-logout security for APA compliance

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordInput from '@/components/ui/PasswordInput';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  // Check for security-related message in URL parameters
  useEffect(() => {
    const message = searchParams.get('message');
    const resetSuccess = searchParams.get('reset');
    const verified = searchParams.get('verified');
    
    if (message) {
      setSecurityMessage(decodeURIComponent(message));
    } else if (resetSuccess === 'success') {
      setSecurityMessage('Your password has been reset successfully. Please sign in with your new password.');
    } else if (verified === 'true') {
      setSecurityMessage('Your email has been verified successfully! Please sign in to continue.');
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🔐 Step 1: Authenticate via POST
      const res = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      let signInData;
      try {
        signInData = await res.json();
      } catch (parseErr) {
        console.error('Failed to parse sign-in response:', parseErr);
      }

      if (!res.ok) {
        let message = 'Unable to sign in. Please check your credentials.';
        if (signInData?.error === 'Invalid credentials') {
          message = 'The email or password you entered is incorrect.';
        } else if (signInData?.error === 'Awaiting parent approval') {
          message = 'Your account requires parent approval before signing in.';
        } else if (signInData?.error === 'Email not verified') {
          message = 'Please verify your email before signing in.';
          // Store email in localStorage for the verification pending page
          if (signInData.email) {
            localStorage.setItem('pendingVerificationEmail', signInData.email);
          }
          // Redirect to verification pending page
          router.push('/verification-pending');
          return; // Exit early to prevent further processing
        } else if (signInData?.error) {
          message = signInData.error;
        }
        throw new Error(message);
      }

      const directUserData = signInData?.user;

      // 🔐 APA-SAFE: Wait briefly for cookie to sync
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 🔍 Step 2: Fetch verified session
      let userData;
      let attemptCount = 0;
      const maxAttempts = 2;

      while (attemptCount < maxAttempts) {
        attemptCount++;
        try {
          const userRes = await fetch('/auth/status', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            credentials: 'include',
            cache: 'no-store',
          });

          if (!userRes.ok) {
            const altRes = await fetch('/api/auth/status', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
              credentials: 'include',
              cache: 'no-store',
            });

            if (!altRes.ok) {
              if (attemptCount >= maxAttempts) {
                throw new Error('Unable to verify your session. Please try again.');
              }
              await new Promise((resolve) => setTimeout(resolve, 500));
              continue;
            }

            userData = await altRes.json();
            break;
          } else {
            userData = await userRes.json();
            break;
          }
        } catch (err) {
          console.error(`Session fetch error (attempt ${attemptCount}):`, err);
          if (attemptCount >= maxAttempts) {
            throw new Error('Unable to verify your session. Please try again.');
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      const user = directUserData || userData?.user;

      if (!user || !user.id) {
        console.error('Missing user ID in responses:', { directUserData, statusData: userData });
        throw new Error('Your session could not be established. Please try signing in again.');
      }

      console.log('✅ Authenticated user:', user.id);
      console.log('Cookies present:', document.cookie.length > 0 ? 'Yes' : 'No');

      const account = userData?.user?.account || user.account;
      const profile = userData?.user?.myProfile || user.myProfile;

      console.log('🔍 User state:', {
        hasProfile: !!profile,
        hasAccount: !!account,
        role: account?.role,
        plan: account?.stripeStatus,
      });

      // 🚫 Block unapproved children
      if (account?.role === 'Child' && !account.isApproved) {
        console.log('Redirecting unapproved child to approval-pending page');
        router.push('/approval-pending');
        return;
      }

      // 🧾 Plan check - simplified to just check for existence of a plan
      console.log('[Post-login] plan:', account?.plan, 'stripeStatus:', account?.stripeStatus);
      if (!account?.plan) {
        console.log('No plan selected — redirecting to /choose-plan');
        router.push('/choose-plan');
        return;
      }

      // 👤 Profile check - be more lenient, let session-ping handle final routing
      if (!profile) {
        console.log('No profile detected in sign-in form, but proceeding to session-ping for final routing');
        // Don't redirect here - let session-ping handle it
      }

      console.log(`✅ User signed in: ${account?.role}, account.isApproved: ${account?.isApproved}, plan: ${account?.plan || 'none'}`);

      // Check if this is a parent coming from approval email
      const parentApprovalContext = sessionStorage.getItem('parentApprovalContext');
      if (parentApprovalContext) {
        try {
          const { inviteCode, childId } = JSON.parse(parentApprovalContext);
          sessionStorage.removeItem('parentApprovalContext');
          console.log('[APA] Parent approval context found, redirecting back to approval page');
          router.push(`/parent-approval?inviteCode=${inviteCode}&childId=${childId}`);
          return;
        } catch (e) {
          console.error('Failed to parse parent approval context:', e);
        }
      }

      // Note: Parent invite redirect now handled server-side via cookie in /api/sign-in (Sol's solution)

      // Check if this is a parent coming from invite flow
      const parentInviteContext = sessionStorage.getItem('parentInviteContext');
      if (parentInviteContext) {
        try {
          const { inviteCode } = JSON.parse(parentInviteContext);
          sessionStorage.removeItem('parentInviteContext');
          console.log('[APA] Parent invite context found, redirecting back to invite page');
          router.push(`/invite/parent?code=${inviteCode}`);
          return;
        } catch (e) {
          console.error('Failed to parse parent invite context:', e);
        }
      }

      // Check if this is an adult coming from invite flow
      const adultInviteContext = sessionStorage.getItem('adultInviteContext');
      if (adultInviteContext) {
        try {
          const { inviteCode } = JSON.parse(adultInviteContext);
          sessionStorage.removeItem('adultInviteContext');
          console.log('[APA] Adult invite context found, redirecting back to invite page');
          router.push(`/invite/adult?code=${inviteCode}`);
          return;
        } catch (e) {
          console.error('Failed to parse adult invite context:', e);
        }
      }

      // 🎉 Final redirect: Track the redirect with console logs
      console.log('[APA] Authentication successful - redirecting to session-ping');
      console.log('[APA] Session cookie length:', document.cookie.length);
      
      // APA-compliant session refresh to ensure up-to-date plan information
      console.log('[APA] Explicitly refreshing session before navigation');
      try {
        const refreshResponse = await fetch('/api/auth/refresh-session', { 
          method: 'GET',
          cache: 'no-store',
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log('[APA] Session refreshed successfully:', refreshData.user?.account?.plan);
        } else {
          console.warn('[APA] Session refresh failed, proceeding with navigation anyway');
        }
      } catch (refreshErr) {
        console.error('[APA] Error during session refresh:', refreshErr);
      }
      
      // ✅ APA COMPLIANCE: Check for parent approval context
      const returnTo = searchParams.get('returnTo');
      const storedParentContext = sessionStorage.getItem('parentApprovalContext');
      
      if (returnTo && (returnTo.includes('parent-approval') || returnTo.includes('parents/hq'))) {
        console.log('[APA] Parent context detected, redirecting to:', returnTo);
        // Force Next.js to rehydrate with updated state
        router.refresh();
        // Add a short delay to ensure session cookie is processed
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Redirect to the specified return URL
        window.location.replace(decodeURIComponent(returnTo));
        return;
      }
      
      if (storedParentContext) {
        console.log('[APA] Parent approval context found in sessionStorage, redirecting to /parents/hq');
        // Force Next.js to rehydrate with updated state
        router.refresh();
        // Add a short delay to ensure session cookie is processed
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Redirect to parents HQ for child approval
        window.location.replace('/parents/hq');
        return;
      }
      
      // Force Next.js to rehydrate with updated state
      router.refresh();
      
      // Add a short delay to ensure session cookie is processed
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Use router.push instead of window.location.replace to avoid flash
      router.push('/session-ping?t=' + Date.now());

    } catch (err: any) {
      console.error('❌ Sign-in error:', err);
      setError(err.message || 'Something went wrong while signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      {/* 🔐 APA-HARDENED - Security notification */}
      {securityMessage && (
        <div className="p-3 rounded bg-blue-50 border border-blue-100 mb-4">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm text-blue-800 font-medium">{securityMessage}</p>
          </div>
        </div>
      )}
      
      {/* APA-compliant password reset success message */}
      {searchParams.get('reset') === 'success' && (
        <div className="p-3 rounded bg-green-50 border border-green-200 mb-4">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm text-green-800 font-medium">Password reset successful!</p>
              <p className="text-xs text-green-700">Please sign in with your new password.</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Email or Username</label>
        <input
          type="text"
          autoComplete="username email"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full border px-3 py-2 rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="text-sm"
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-100">
          <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 text-sm w-full hover:text-[#c032d1]"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
