'use client';

// 🔐 APA-HARDENED — SIGN-IN FORM
// Posts to /api/sign-in, then fetches /auth/status to verify session
// Includes fallback to /api/auth/status for deployment edge cases
// Auto-logout security for APA compliance

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  // Check for security-related message in URL parameters
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSecurityMessage(decodeURIComponent(message));
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
        body: JSON.stringify({ email, password }),
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
      const profile = userData?.user?.profile || user.profile;

      console.log('🔍 User state:', {
        hasProfile: !!profile,
        hasAccount: !!account,
        role: profile?.role,
        plan: account?.stripeStatus,
      });

      // 🚫 Block unapproved children
      if (profile?.role === 'Child' && !profile.isApproved) {
        console.log('Redirecting unapproved child to approval-pending page');
        router.push('/approval-pending');
        return;
      }

      // 🧾 Plan check
      console.log('[Post-login] stripeStatus:', account?.stripeStatus);
      const ACTIVE_STATUSES = ['active', 'verified', 'paid', 'trialing', 'test']; // TEMP: allow 'test' for free plan testing
      if (!account?.stripeStatus || !ACTIVE_STATUSES.includes(account.stripeStatus)) {
        console.log('No active plan — redirecting to /choose-plan');
        router.push('/choose-plan');
        return;
      }

      // 👤 Require profile
      if (!profile) {
        console.log('No profile — redirecting to /profile/create');
        router.push('/profile/create');
        return;
      }

      console.log(`✅ User signed in: ${profile.role}, approved: ${profile.isApproved}, plan: ${account?.plan || 'none'}`);

      // 🎉 Final redirect: Track the redirect with console logs
      console.log('Authentication successful - redirecting to /my-cliqs');
      console.log('Session cookie length:', document.cookie.length);
      
      // Use direct navigation for more reliable session handling
      // Include a unique timestamp to force a fresh request
      setTimeout(() => {
        // Pass auth=true parameter to help debug the middleware token validation
        window.location.href = `/my-cliqs?auth=true&t=${Date.now()}`;
      }, 1500);

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

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded text-sm"
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
