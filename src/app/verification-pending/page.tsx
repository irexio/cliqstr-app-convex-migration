'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VerificationPendingPage() {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Retrieve email from localStorage on component mount
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('pendingVerificationEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  const handleResendVerification = async () => {
    if (!email) {
      setResendStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsResending(true);
    setResendStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendStatus('success');
      } else {
        setResendStatus('error');
        setErrorMessage(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setResendStatus('error');
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to{' '}
          <span className="font-medium">{email || 'your email address'}</span>.
        </p>
        <p className="text-gray-600 mb-6">
          Please click the link in the email to verify your account and continue setting up your Cliqstr account.
        </p>
        
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 text-left">
          <p className="text-sm text-gray-700">
            <strong>What's next?</strong> After verifying your email, you'll be prompted to sign in again and complete your account setup by selecting a plan.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {resendStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">
            Verification email resent successfully!
          </div>
        )}
        
        {resendStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            Failed to resend verification email. Please try again.
          </div>
        )}
        
        <button 
          onClick={handleResendVerification}
          className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          disabled={isResending}
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Already verified? <Link href="/sign-in" className="text-blue-600 underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
