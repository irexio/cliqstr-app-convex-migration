// 🔐 APA-HARDENED — Page shell for parent approval of child user.
// This renders the parent approval flow with ID verification.

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ParentApprovalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'verify' | 'upload' | 'success'>('verify');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get parameters from URL that was in parent email link
  const childName = searchParams.get('name') || 'your child';
  const cliqName = searchParams.get('cliq') || 'the Cliq';
  const requestId = searchParams.get('id') || '';
  
  // Handle verification step
  const handleStartVerification = () => {
    setStep('upload');
  };
  
  // Handle ID upload and approval
  const handleApproveAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // In real implementation, this would process the ID upload
      // and call an API endpoint to verify and approve
      
      const response = await fetch('/api/parent-approval/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
      
      setStep('success');
    } catch (err) {
      console.error('Approval error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Success view after approval
  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Permission Granted</h2>
          <p className="text-sm text-green-700">
            You've successfully granted {childName} permission to join {cliqName}.
          </p>
        </div>
        
        <h3 className="text-lg font-medium mb-4">Want to enhance their experience?</h3>
        <button 
          onClick={() => router.push('/choose-plan')} 
          className="w-full bg-[#c032d1] hover:bg-[#a02bae] text-white font-medium py-3 px-4 rounded-md transition"
        >
          Explore Membership Options
        </button>
        <button 
          onClick={() => router.push('/')} 
          className="w-full mt-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-md transition"
        >
          Maybe Later
        </button>
      </div>
    );
  }
  
  // ID upload view
  if (step === 'upload') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-[#202020] mb-4 font-poppins">Verify Your Identity</h1>
        <p className="text-sm text-gray-600 mb-6">
          To comply with age verification requirements, please upload your driver's license 
          or other government-issued ID showing you are over 18.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleApproveAccess} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-300 transition cursor-pointer">
            <label htmlFor="id-upload" className="flex flex-col items-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              <span className="text-sm font-medium text-gray-600">Click to upload or drag and drop</span>
              <span className="text-xs text-gray-500 mt-1">Driver's license or government ID</span>
              <input id="id-upload" name="id-upload" type="file" className="sr-only" accept="image/*" />
            </label>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-medium">Privacy Notice</p>
            <p className="mt-1">Your ID is used only for age verification and will not be stored permanently.</p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#c032d1] hover:bg-[#a02bae] text-white font-medium py-3 px-4 rounded-md transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-purple-300"
          >
            {isLoading ? 'Verifying...' : 'Approve Access'}
          </button>
        </form>
      </div>
    );
  }
  
  // Initial verification page
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Parent Approval Required</h1>
      <p className="text-sm text-gray-600 mb-6">
        {childName} has been invited to join {cliqName} on Cliqstr. As their parent or guardian, 
        please verify your identity to approve this request.
      </p>
      
      <button
        onClick={handleStartVerification}
        className="w-full bg-[#c032d1] hover:bg-[#a02bae] text-white font-medium py-3 px-4 rounded-md transition"
      >
        Start Verification
      </button>
    </div>
  );
}
