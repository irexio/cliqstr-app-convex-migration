'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect component that sends users to the working dashboard page
 * This fixes the issue where raw HTML was being displayed due to a missing API endpoint
 */
export default function MyCliqsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the working dashboard implementation
    router.replace('/my-cliqs-dashboard');
  }, [router]);

  // Show a simple loading message while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
