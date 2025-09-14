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
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Next Steps - Please Help Your Child:</h3>
          <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
            <li><strong>Sign Out:</strong> You can sign out and let your child sign in with their new username and password</li>
            <li><strong>Child Sign In:</strong> Help your child sign in to Cliqstr using their new username and password</li>
            <li><strong>Create Profile:</strong> Help your child set up their profile if needed</li>
            <li><strong>Create a Cliq:</strong> Help your child create their first cliq</li>
            <li><strong>Send Invites:</strong> Show your child how to send invites to friends</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <input type="checkbox" id="safetyPartnership" className="mt-1" />
            <label htmlFor="safetyPartnership" className="text-yellow-800 text-sm">
              <strong>I understand that Cliqstr will do all they can to protect my child, but I am an equal partner in ensuring my child's safety.</strong>
            </label>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => router.push('/parents/hq')}
            className="bg-green-600 hover:bg-green-700"
          >
            Go to Parents HQ
          </Button>
          
          <Button 
            onClick={() => router.push('/')}
            variant="outline"
          >
            Go to Home Page
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
