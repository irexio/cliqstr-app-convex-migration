// 🔐 APA-HARDENED — Parent Approval Landing Page
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Force dynamic rendering to prevent static generation issues with useSearchParams
export const dynamic = 'force-dynamic';

function ParentApprovalContent() {
  try {
    const searchParams = useSearchParams();
    const inviteCode = searchParams.get('inviteCode') ?? '';
    
    // Debug logging
    console.log('[PARENT_APPROVAL] Rendering with inviteCode:', inviteCode);
    
    // If no invite code, redirect to home
    if (!inviteCode) {
      console.log('[PARENT_APPROVAL] No invite code, redirecting to home');
      window.location.href = '/';
      return null;
    }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
          Parent/Guardian Approval
        </h1>

        <div className="space-y-4">
          <Button 
            className="w-full h-14 text-lg bg-black text-white hover:bg-gray-900" 
            asChild
          >
            <a href={`/parents/hq?inviteCode=${inviteCode}`}>
              Continue to Approve Child Invite
            </a>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-14 text-gray-700 text-sm" 
            asChild
          >
            <a href="/">Decline This Invitation</a>
          </Button>
        </div>
      </div>
    </main>
  );
  } catch (error) {
    console.error('[PARENT_APPROVAL] Error rendering component:', error);
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
            Something went wrong
          </h1>
          <p className="text-gray-600">Please try again or contact support.</p>
          <a href="/" className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900">
            Return Home
          </a>
        </div>
      </main>
    );
  }
}

export default function ParentApprovalPage() {
  console.log('[PARENT_APPROVAL] Page component mounting');
  
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approval page...</p>
        </div>
      </main>
    }>
      <ParentApprovalContent />
    </Suspense>
  );
}
