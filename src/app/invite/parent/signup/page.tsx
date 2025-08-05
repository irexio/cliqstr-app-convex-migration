'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/PasswordInput';

/**
 * 🛡️ DEDICATED Parent Invite Sign-Up Page
 * 
 * This is a separate sign-up flow specifically for new parents 
 * who receive child invites. It doesn't interfere with the main 
 * sign-up flow and ensures proper redirect to Parent HQ.
 */

function ParentInviteSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('inviteCode');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthdate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create the account with pre-verification (since they clicked email invite)
      const signUpResponse = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          inviteCode,
          context: 'parent-invite', // Special context for parent invites
          preVerified: true // Skip email verification since they clicked invite link
        })
      });

      const signUpData = await signUpResponse.json();

      if (!signUpResponse.ok) {
        throw new Error(signUpData.error || 'Failed to create account');
      }

      // Direct redirect to Parent HQ - no verification needed!
      router.push(`/parents/hq?inviteCode=${inviteCode}`);

    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!inviteCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600">Invalid invite link. Please check your email for the correct link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">🛡️ Parent Account Setup</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Create your parent account to approve the child invitation
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="birthdate">Birthdate</Label>
              <Input
                id="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Account...' : 'Create Parent Account'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your account will be ready immediately after creation.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingParentSignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading parent sign-up...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main export with Suspense wrapper
export default function ParentInviteSignUpPage() {
  return (
    <Suspense fallback={<LoadingParentSignUp />}>
      <ParentInviteSignUpForm />
    </Suspense>
  );
}
