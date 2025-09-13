'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Suspense } from 'react';

function ParentsHQSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childName = searchParams.get('childName');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-green-800 mb-4">Success!</h1>
        
        <p className="text-green-700 mb-6">
          {childName ? (
            <>Your child <strong>{childName}</strong>'s account has been created successfully!</>
          ) : (
            <>Your child's account has been created successfully!</>
          )}
        </p>
        
        <p className="text-green-600 mb-6">
          They can now sign in to Cliqstr and start connecting with their friends and family.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => router.push('/my-cliqs-dashboard')}
            className="bg-green-600 hover:bg-green-700"
          >
            Go to Dashboard
          </Button>
          
          <Button 
            onClick={() => router.push('/')}
            variant="outline"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ParentsHQSuccess() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Setting up success page</p>
        </div>
      </div>
    }>
      <ParentsHQSuccessContent />
    </Suspense>
  );
}
