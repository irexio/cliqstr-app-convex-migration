'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

function ParentSignupRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('code');

  useEffect(() => {
    // Redirect to new Parents HQ wizard
    const targetUrl = inviteCode 
      ? `/parents/hq?inviteCode=${encodeURIComponent(inviteCode)}`
      : '/parents/hq';
    
    router.replace(targetUrl);
  }, [router, inviteCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Redirecting to Parents HQ...</p>
    </div>
  );
}

export default function ParentSignupRedirect() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    }>
      <ParentSignupRedirectContent />
    </Suspense>
  );
}
