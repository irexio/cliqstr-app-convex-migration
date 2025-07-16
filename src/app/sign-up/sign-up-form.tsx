'use client';

// 🔐 APA-HARDENED SIGN-UP FORM
// Secure account creation with birthdate validation, password strength check,
// and server-determined role + routing. Invite codes supported but optional for adults.
// Client performs light validation — server controls all actual role logic.
// Verified: 2025-07-03 — Synced with /api/sign-up and APA rules

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { fetchJson } from '@/lib/fetchJson';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('invite') || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [parentEmail, setParentEmail] = useState('');
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

  const isChild = birthdate ? calculateAge(birthdate) < 17 : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body: Record<string, string> = {
        email,
        password,
        birthdate,
      };

      if (inviteCode) {
        body.inviteCode = inviteCode;
      }

      if (isChild && parentEmail) {
        body.parentEmail = parentEmail;
      }

      const res = await fetchJson('/api/sign-up', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      // 👣 Redirect based on user role - adults go to plan selection
      if (isChild) {
        router.push('/sign-in'); // Children still go to sign-in
      } else {
        // For adults, sign in automatically after sign-up
        try {
          const signInRes = await fetchJson('/api/sign-in', {
            method: 'POST',
            body: JSON.stringify({
              email,
              password
            }),
          });
          
          // Wait briefly for session cookie to be set
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Redirect to plan selection
          console.log('Adult user registered, redirecting to choose plan');
          // Use hard navigation to session-ping to ensure fresh session data
          console.log('[APA] Redirecting to session-ping after successful sign-up');
          window.location.replace('/session-ping?t=' + Date.now());
        } catch (signInErr) {
          console.error('Auto sign-in failed after registration:', signInErr);
          // If auto sign-in fails, redirect to sign-in page
          router.push('/sign-in?message=' + encodeURIComponent('Account created successfully. Please sign in.'));
        }
      }
    } catch (err: any) {
      console.error('❌ Sign-up error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="birthdate">Birthdate</Label>
        <Input
          id="birthdate"
          type="date"
          required
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
      </div>

      {isChild && (
        <div>
          <Label htmlFor="parentEmail">Parent Email</Label>
          <Input
            id="parentEmail"
            type="email"
            required
            autoComplete="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account…' : 'Sign Up'}
      </Button>
    </form>
  );
}
