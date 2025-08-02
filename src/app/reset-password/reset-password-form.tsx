'use client';

// 🔐 APA-HARDENED — Reset Password Form Component
// Secure reset logic using one-time code from email. No client-side role logic.
// All validation and persistence are handled server-side.
// No automatic login after password reset - enforces manual login.

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { fetchJson } from '@/lib/fetchJson';
import PasswordInput from '@/components/ui/PasswordInput';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || searchParams.get('token'); // Support both new code param and legacy token param

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!newPassword || !code) {
      setError('Password and reset code are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetchJson('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code, newPassword }),
      });

      setSuccess(true);
      // APA requirement: No automatic login after password reset
      // User must manually log in to pass role and approval checks
      setTimeout(() => router.push('/sign-in?reset=success'), 3000);
    } catch (err: any) {
      console.error('❌ Reset error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">
        Reset Your Password
      </h1>

      <Label className="mt-4">New Password</Label>
      <PasswordInput
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        autoComplete="new-password"
      />

      {error && <p className="text-red-500 mt-3">{error}</p>}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mt-3">
          <p className="font-medium">Password successfully updated!</p>
          <p className="text-sm">For security reasons, you'll need to sign in with your new password.</p>
          <p className="text-sm mt-1">Redirecting to sign-in page...</p>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        className="mt-6 w-full"
        disabled={loading}
      >
        {loading ? 'Updating Password…' : 'Reset Password'}
      </Button>
    </div>
  );
}
