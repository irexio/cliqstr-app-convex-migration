'use client';

// 🔐 APA-HARDENED by Aiden — Reset Password Form Component
// Secure reset logic using token from email. No client-side role logic.
// All validation and persistence are handled server-side.

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { fetchJson } from '@/lib/fetchJson';

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
      setTimeout(() => router.push('/sign-in'), 2000);
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
      <Input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="••••••••"
      />

      {error && <p className="text-red-500 mt-3">{error}</p>}
      {success && <p className="text-green-600 mt-3">Password updated. Redirecting…</p>}

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
