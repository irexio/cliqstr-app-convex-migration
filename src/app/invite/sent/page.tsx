'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

function InviteSentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientName = searchParams.get('name') || 'your friend';
  const inviteType = searchParams.get('type') || 'member';

  useEffect(() => {
    // Clear any stored invite data
    sessionStorage.removeItem('pendingInvite');
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">Invitation Sent!</h1>
        
        <p className="text-lg text-gray-700">
          Your invitation to {recipientName} has been sent successfully.
        </p>

        {inviteType === 'child' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What happens next:</strong> The parent/guardian will receive an email 
              to approve this invitation. Once approved, {recipientName} will be able to join your cliq.
            </p>
          </div>
        )}

        {inviteType === 'adult' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>What happens next:</strong> {recipientName} will receive an email 
              with instructions to join your cliq.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button 
            onClick={() => router.push('/my-cliqs-dashboard')}
            className="min-w-[150px]"
          >
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => router.back()}
            variant="outline"
            className="min-w-[150px]"
          >
            Send Another Invite
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function InviteSentPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading...</div>}>
      <InviteSentContent />
    </Suspense>
  );
}