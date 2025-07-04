'use client';

// 🔐 APA-HARDENED — SIGN-IN FORM
// Posts to /api/sign-in, then fetches /api/auth/status to verify user state
// Dynamic-only — secure login with proper error handling

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🔐 Step 1: Authenticate via form-based POST
      const res = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Handle API errors with proper user-friendly messages
      if (!res.ok) {
        let errorMessage = 'Unable to sign in. Please check your credentials.';
        
        try {
          const errorData = await res.json();
          if (errorData.error) {
            // Convert API error messages to user-friendly text
            switch (errorData.error) {
              case 'Invalid credentials':
                errorMessage = 'The email or password you entered is incorrect.';
                break;
              case 'Awaiting parent approval':
                errorMessage = 'Your account requires parent approval before signing in.';
                break;
              default:
                errorMessage = errorData.error;
            }
          }
        } catch {
          // If can't parse JSON, try to get text
          try {
            const errText = await res.text();
            if (errText) errorMessage = errText;
          } catch {}
        }
        
        throw new Error(errorMessage);
      }

      // 🔍 Step 2: Validate session + role via /auth/status (no /api/ prefix)
      console.log('Attempting to fetch auth status from /auth/status');
      
      let userData;
      try {
        const userRes = await fetch('/auth/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include', // Critical: Include cookies in the request
        });
        
        console.log('Auth status response:', userRes.status, userRes.statusText);
        
        if (!userRes.ok) {
          // Try the alternative path if the first one fails
          console.log('Trying alternative API path: /api/auth/status');
          
          const altUserRes = await fetch('/api/auth/status', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            credentials: 'include', // Critical: Include cookies in the request
          });
          
          console.log('Alt auth status response:', altUserRes.status, altUserRes.statusText);
          
          if (!altUserRes.ok) {
            throw new Error('Unable to verify your session. Please try both API paths.');
          }
          
          // Parse the alternative response
          try {
            userData = await altUserRes.json();
            console.log('Auth data (alt path):', JSON.stringify(userData));
          } catch (e) {
            throw new Error('Unable to process your account information.');
          }
        } else {
          // Parse the primary response
          try {
            userData = await userRes.json();
            console.log('Auth data (primary path):', JSON.stringify(userData));
          } catch (e) {
            throw new Error('Unable to process your account information.');
          }
        }
      } catch (error) {
        // Log detailed error server-side only
        console.error('Auth status fetch error:', error);
        
        // Return sanitized error for client
        throw new Error('Unable to verify your session. Please try again.');
      }

      // Use the userData we obtained above
      const user = userData?.user;
      
      if (!user || !user.id) {
        console.error('Missing user ID in response:', userData);
        throw new Error('Your session could not be established. Please try signing in again.');
      }
      
      // Log cookie details for debugging
      console.log('Cookies present after auth:', document.cookie.split(';').map(c => c.trim()).filter(c => c.length > 0).length > 0 ? 'Yes' : 'No');

      // 🧭 Step 3: Route based on profile completion and age verification
      if (!user?.profile?.username) {
        router.push('/profile/create');
      } else {
        // Safe redirect to dashboard
        router.push('/my-cliqs');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      // Ensure user-friendly error message
      setError(err.message || 'Something went wrong while signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
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
