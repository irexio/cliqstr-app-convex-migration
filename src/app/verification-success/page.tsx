/**
 * Email Verification Success Page
 * 
 * Displayed when a user successfully verifies their email address
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerificationSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            Email Verified Successfully!
          </h2>
          <p className="mt-2 text-gray-600">
            Your email has been verified. Thank you for confirming your account.
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Redirecting to your dashboard in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
