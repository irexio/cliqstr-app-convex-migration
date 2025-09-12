'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

/**
 * Email Verification Page
 * 
 * This page handles the verification link from emails
 * It extracts the code from the URL and forwards it to the API
 */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setError('No verification code provided');
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch(`/api/verify-email?code=${encodeURIComponent(code || '')}`);
        
        if (response.ok) {
          setStatus('success');
          // Start countdown for redirect to sign-in
          let count = 5;
          const timer = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count <= 0) {
              clearInterval(timer);
              router.push('/sign-in?verified=true');
            }
          }, 1000);
        } else {
          const data = await response.json();
          setStatus('error');
          setError(data.error || 'Verification failed');
        }
      } catch (err) {
        console.error('Error verifying email:', err);
        setStatus('error');
        setError('An unexpected error occurred');
      }
    }

    verifyEmail();
  }, [code, router]);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      {status === 'verifying' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
          <div className="animate-pulse flex justify-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      
      {status === 'success' && (
        <div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-green-600">Email Verified!</h1>
          <p className="text-gray-600 mb-6">Your email has been successfully verified.</p>
          <p className="text-gray-600 mb-4">You will be redirected to sign in in {countdown} seconds...</p>
          <Link href="/sign-in?verified=true" className="inline-block py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition-colors">
            Sign In Now
          </Link>
        </div>
      )}
      
      {status === 'error' && (
        <div>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-red-600">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <Link href="/verification-pending" className="inline-block py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition-colors">
              Try Again
            </Link>
            <p className="text-sm text-gray-500">
              Need help? <Link href="/contact" className="text-blue-600 underline">Contact Support</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading verification...</h1>
        <div className="animate-pulse flex justify-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
