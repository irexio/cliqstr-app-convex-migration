'use client';

// 🔐 APA-HARDENED SIGN-UP FORM - Child-Aware Flow
// Starts with firstName + birthdate, then branches based on age:
// - Children: Parent approval flow
// - Adults: Full account creation
// Maintains APA compliance with proper child protection

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { fetchJson } from '@/lib/fetchJson';

type FlowStep = 'initial' | 'child-parent-email' | 'adult-credentials' | 'child-success' | 'adult-processing';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('invite') || null;

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>('initial');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChild, setIsChild] = useState(false);

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

  // Handle initial form submission (firstName + birthdate)
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName || !lastName || !birthdate) {
      setError('Please fill in all required fields');
      return;
    }
    
    const age = calculateAge(birthdate);
    const childStatus = age < 18;
    setIsChild(childStatus);
    
    if (childStatus) {
      // Child flow - show parent email step
      setCurrentStep('child-parent-email');
    } else {
      // Adult flow - show credentials step
      setCurrentStep('adult-credentials');
    }
  };
  
  // Handle parent email submission for children
  const handleChildParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await fetchJson('/api/parent-approval/request', {
        method: 'POST',
        body: JSON.stringify({
          childFirstName: firstName,
          childLastName: lastName,
          childBirthdate: birthdate,
          parentEmail: parentEmail,
        }),
      });
      
      setCurrentStep('child-success');
      // Redirect to awaiting-approval page after a short delay to show success message
      setTimeout(() => {
        router.push('/awaiting-approval');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send parent approval request');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adult credentials submission
  const handleAdultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!firstName || !lastName || !birthdate) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const body: Record<string, string> = {
        firstName,
        lastName,
        email,
        password,
        birthdate,
      };

      if (inviteCode) {
        body.inviteCode = inviteCode;
      }

      const res = await fetchJson('/api/sign-up', {
        method: 'POST',
        body: JSON.stringify(body),
      });

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
        
        // Redirect to plan selection page first
        console.log('Adult user registered, redirecting to plan selection');
        console.log('[APA] Redirecting to choose-plan after successful sign-up');
        window.location.replace('/choose-plan?t=' + Date.now());
      } catch (signInErr) {
        console.error('Auto sign-in failed after registration:', signInErr);
        // If auto sign-in fails, redirect to sign-in page
        router.push('/sign-in?message=' + encodeURIComponent('Account created successfully. Please sign in.'));
      }
    } catch (err: any) {
      console.error('❌ Sign-up error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Child success message
  if (currentStep === 'child-success') {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">Parent Approval Sent!</h2>
          <p className="text-green-700 mb-4">
            Hi {firstName}! We've emailed your parent/guardian for approval. Once they approve, you'll be able to create your account!
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

  // Step 1: Initial form (firstName + birthdate)
  if (currentStep === 'initial') {
    return (
      <form onSubmit={handleInitialSubmit} className="space-y-4">
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
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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

        {error && (
          <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Processing...' : 'Continue'}
        </Button>
      </form>
    );
  }
  
  // Step 2: Child parent email
  if (currentStep === 'child-parent-email') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Hi {firstName}!</h3>
          <p className="text-blue-800 text-sm">
            We're so glad you want to join Cliqstr. Because you're under 18, your parent or guardian will need to approve your account first.
          </p>
        </div>
        
        <form onSubmit={handleChildParentSubmit} className="space-y-4">
          <div>
            <Label htmlFor="parentEmail">Parent/Guardian Email</Label>
            <Input
              id="parentEmail"
              type="email"
              required
              autoComplete="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@example.com"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending approval request...' : 'Send Approval Request'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setCurrentStep('initial')}
            className="w-full"
          >
            Back
          </Button>
        </form>
      </div>
    );
  }
  
  // Step 3: Adult credentials
  if (currentStep === 'adult-credentials') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-green-900 mb-2">Great, {firstName}!</h3>
          <p className="text-green-800 text-sm">
            Let's finish creating your account.
          </p>
        </div>
        
        <form onSubmit={handleAdultSubmit} className="space-y-4">
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

          {error && (
            <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setCurrentStep('initial')}
            className="w-full"
          >
            Back
          </Button>
        </form>
      </div>
    );
  }
  
  // Fallback
  return null;
}
