'use client';

// 🔐 APA-HARDENED by Aiden — Replaces custom Input with native date field.
// Fixes browser inconsistencies (Chrome, Firefox, Safari) with <input type="date">

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('invite') || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    const parsedDate = new Date(birthdate);
    if (!birthdate || isNaN(parsedDate.getTime())) {
      setError('Please enter a valid birthdate.');
      setLoading(false);
      return;
    }

    const formattedDate = parsedDate.toISOString().split('T')[0];
    const age = calculateAge(formattedDate);
    const role =
      age < 18 ? (inviteCode ? 'child_invited' : 'child_direct') : 'adult';

    try {
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          birthdate: formattedDate,
          role,
          inviteCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sign-up failed');
      }

      if (role.startsWith('child')) {
        router.push('/parent-approval');
      } else {
        router.push('/choose-plan');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Create Your Account</h1>

      <Label>Email</Label>
      <Input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <Label className="mt-4">Password</Label>
      <Input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <Label className="mt-4">Birthdate</Label>
      <input
        type="date"
        value={birthdate}
        onChange={e => setBirthdate(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />

      {error && <p className="text-red-500 mt-3">{error}</p>}

      <Button
        onClick={handleSubmit}
        className="mt-6 w-full"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </div>
  );
}
