/**
 * Email Verification Error Page
 * 
 * Displayed when there's an issue with email verification
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerificationErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  
  // Get error reason from URL params
  const reason = searchParams?.get('reason') || 'unknown';
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'missing-token': 'Verification link is missing required information.',
    'invalid-token': 'This verification link is invalid or has expired.',
    'server-error': 'There was a server error processing your verification.',
    'unknown': 'An unknown error occurred during verification.',
  };
  
  const errorMessage = errorMessages[reason] || errorMessages.unknown;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/my-cliqs'); // Redirect to main dashboard
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            Verification Failed
          </h2>
          <p className="mt-2 text-gray-600">
            {errorMessage}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Don't worry, this won't affect your ability to use Cliqstr. Email verification is optional.
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Redirecting to your dashboard in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
