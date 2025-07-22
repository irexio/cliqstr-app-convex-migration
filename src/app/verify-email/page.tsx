'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Email Verification Page
 * 
 * This page handles the verification link from emails
 * It extracts the code from the URL and forwards it to the API
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorReason, setErrorReason] = useState('');

  useEffect(() => {
    async function verifyEmail() {
      try {
        const code = searchParams?.get('code');
        
        if (!code) {
          setStatus('error');
          setErrorReason('missing-code');
          return;
        }

        // Forward to the API endpoint
        const response = await fetch(`/api/verify-email?code=${code}`);
        
        // The API will handle redirects, but we'll handle errors here just in case
        if (!response.ok) {
          const data = await response.json();
          setStatus('error');
          setErrorReason(data.error || 'server-error');
          router.push(`/verification-error?reason=${data.error || 'server-error'}`);
          return;
        }

        setStatus('success');
        router.push('/verification-success');
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setErrorReason('server-error');
        router.push('/verification-error?reason=server-error');
      }
    }

    verifyEmail();
  }, [searchParams, router]);

  // Show loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c032d1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    </div>
  );
}
