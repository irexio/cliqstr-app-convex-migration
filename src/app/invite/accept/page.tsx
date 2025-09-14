'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth/session-config';

function InviteAcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSignup, setPendingSignup] = useState<any>(null);

  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      setError('No approval code provided');
      setLoading(false);
      return;
    }

    // Check if this is a parent approval token
    checkParentApprovalToken(code);
  }, [code]);

  const checkParentApprovalToken = async (token: string) => {
    try {
      // First, clear any existing session to ensure the parent starts fresh
      await fetch('/api/auth/clear-session', { method: 'POST' });
      
      const response = await fetch(`/api/parent-approval/accept?token=${encodeURIComponent(token)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid approval code');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.approval) {
        // This is a parent approval token - redirect to appropriate page based on parent state
        setPendingSignup(data.approval);
        
        if (data.approval.parentState === 'existing_parent') {
          // Existing parent - go directly to Parents HQ
          router.push(`/parents/hq/dashboard?approvalToken=${encodeURIComponent(token)}`);
        } else {
          // New parent or existing adult - redirect to sign-up with email pre-filled
          // Store the approval token in localStorage so sign-up can access it
          localStorage.setItem('parentApprovalToken', token);
          localStorage.setItem('parentApprovalData', JSON.stringify(data.approval));
          router.push(`/sign-up?email=${encodeURIComponent(data.approval.parentEmail)}&approvalToken=${encodeURIComponent(token)}`);
        }
      } else {
        // This might be a regular invite - handle accordingly
        setError('Invalid approval code');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking approval token:', error);
      setError('Failed to verify approval code');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying approval code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Verification Failed</h2>
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Parents HQ...</p>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading approval verification...</h1>
          <div className="animate-pulse flex justify-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    }>
      <InviteAcceptContent />
    </Suspense>
  );
}
