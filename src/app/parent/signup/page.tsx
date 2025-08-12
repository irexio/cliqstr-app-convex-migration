'use client';

/**
 * 🔐 APA-HARDENED COMPONENT: Parent Signup Page
 * 
 * Used when parents receive child invite emails
 * 
 * Purpose:
 *   - Special welcome page for invited parents
 *   - Pre-fills email from invite
 *   - Creates verified Parent account
 *   - Redirects to Parents HQ for child setup
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

function ParentSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('code')?.trim() || '';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [validatingInvite, setValidatingInvite] = useState(true);

  // Validate invite and pre-fill email on load
  useEffect(() => {
    async function validateInvite() {
      if (!inviteCode) {
        setError('Invalid invite link. Please use the link from your email.');
        setValidatingInvite(false);
        return;
      }

      try {
        const res = await fetch(`/api/invites/validate?code=${encodeURIComponent(inviteCode)}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setError('This invite link is invalid or has expired.');
          setValidatingInvite(false);
          return;
        }

        if (data.inviteRole !== 'child') {
          setError('This link is not for a child invite.');
          setValidatingInvite(false);
          return;
        }

        // Pre-fill parent email from invite
        setInviteDetails(data);
        setEmail(data.recipientEmail || '');
        setValidatingInvite(false);
      } catch (err) {
        setError('Unable to validate invite. Please try again.');
        setValidatingInvite(false);
      }
    }

    validateInvite();
  }, [inviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    // Ensure email matches invite
    if (email !== inviteDetails?.recipientEmail) {
      setError('Email must match the invited parent email address.');
      setLoading(false);
      return;
    }

    try {
      // Create parent account
      const signupRes = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: 'Parent',
          isVerified: true, // Auto-verify invited parents
          fromInvite: true
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        if (signupData.message?.includes('already exists')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(signupData.message || 'Failed to create account.');
        }
        setLoading(false);
        return;
      }

      // Sign in the new parent
      const signinRes = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!signinRes.ok) {
        setError('Account created but sign-in failed. Please try signing in manually.');
        setLoading(false);
        return;
      }

      // Redirect to Parents HQ with invite code
      router.push(`/parents/hq?inviteCode=${encodeURIComponent(inviteCode)}`);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (validatingInvite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Validating your invitation...</p>
      </div>
    );
  }

  if (error && !inviteDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-red-800 mb-2">Invalid Invite</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Cliqstr!
          </h1>
          <p className="text-gray-600">
            To approve your child's participation, please create a parent account.
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>✓ No charges for invited users</strong><br />
              Credit card required for verification only
            </p>
          </div>
        </div>

        {/* Child Info */}
        {inviteDetails?.friendFirstName && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>{inviteDetails.friendFirstName}</strong> has been invited to join a Cliq!
            </p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Parent/Guardian Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              required
              disabled={loading}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must match the email address that received this invite
            </p>
          </div>

          <div>
            <Label htmlFor="password">Create Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Create Parent Account & Continue'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link 
              href={`/sign-in?returnTo=${encodeURIComponent(`/parents/hq?inviteCode=${inviteCode}`)}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ParentSignupPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    }>
      <ParentSignupContent />
    </Suspense>
  );
}
