'use client';

// 🔐 APA-HARDENED — SIGN-IN FORM
// Posts to /sign-in, then fetches /auth/status to verify user state
// Dynamic-only — avoids /api for secure SSR-free login

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

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Sign-in failed');
      }

      // 🔍 Step 2: Validate session + role via /auth/status
      const userRes = await fetch('/auth/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      const user = await userRes.json();

      if (!user || !user.id) {
        throw new Error('Unable to fetch user session');
      }

      // 🧭 Step 3: Route based on profile completion
      if (!user?.profile?.username) {
        router.push('/profile/create');
      } else {
        router.push('/my-cliqs');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
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
        <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 text-sm w-full"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
