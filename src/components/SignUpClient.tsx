'use client';

// 🔐 APA-HARDENED SIGN-UP CLIENT
// Handles direct sign-ups (email, password, birthdate)
// Posts to /sign-up — APA-safe, no /api

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';

export default function SignUpClient() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password || !birthdate) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, birthdate }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      if (data.requiresApproval) {
        router.push('/parent-approval');
      } else {
        router.push('/profile/setup');
      }
    } catch (err: any) {
      console.error('❌ Sign-up error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Create Your Account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div>
          <Label>Birthdate</Label>
          <Input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? 'Creating Account…' : 'Sign Up'}
        </Button>
      </form>
    </div>
  );
}
