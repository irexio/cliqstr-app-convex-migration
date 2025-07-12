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
    // ...success JSX
  }
  // ...rest of the component JSX
}
