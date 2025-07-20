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

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [childSignupSuccess, setChildSignupSuccess] = useState(false);

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
        firstName,
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
        // Show success message for children instead of redirecting
        setChildSignupSuccess(true);
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

  // Show success message for child sign-ups
  if (childSignupSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">Account Request Sent!</h2>
          <p className="text-green-700 mb-4">
            Hi {firstName}! Your parent/guardian will approve your account and provide you with your username and password.
          </p>
          <p className="text-green-600 text-sm">
            <strong>Be sure to ask them to check their email at:</strong><br />
            <span className="font-mono bg-green-100 px-2 py-1 rounded">{parentEmail}</span>
          </p>
          <div className="mt-6">
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          required
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

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
