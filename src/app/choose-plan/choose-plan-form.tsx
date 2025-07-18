'use client';

// 🔐 APA-HARDENED by Aiden — Do not remove or replace without APA review.
// This form renders the current subscription plan options for Cliqstr users.
// Updated with new plan structure for simplified testing and deployment.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import BaseCard from '@/components/cliqs/BaseCard';

// TEMPORARY: Only showing Test Plan during pre-Stripe beta phase
const PLANS = [
  { key: 'test', label: 'Test Plan', price: '$0', period: 'mo', recommended: false, features: ['Up to 2 cliqs', '10 posts per cliq', 'Posts auto-expire after 30 days'] }
];

// Commented out plans for future use after Stripe integration
/*
const ALL_PLANS = [
  { key: 'test', label: 'Test Plan', price: '$0', period: 'mo', recommended: false, features: ['Up to 2 cliqs', '10 posts per cliq', 'Posts auto-expire after 30 days'] },
  { key: 'basic', label: 'Basic Plan', price: '$5', period: 'mo', recommended: true, features: ['5 cliqs', '25 posts per cliq', 'Auto-expire after 90 days'] },
  { key: 'premium', label: 'Premium Plan', price: '$10', period: 'mo', recommended: false, features: ['10 cliqs', '50 posts per cliq', '1 GB storage'] },
  { key: 'family', label: 'Family Plan', price: '$12', period: 'mo', recommended: false, features: ['3–5 users shared', '25 posts per cliq', '500 MB storage'] },
  { key: 'group', label: 'Group/Org', price: '$25+', period: 'mo', recommended: false, features: ['50 cliqs', '100 posts per cliq', '5 GB+ storage'] }
];
*/

export default function ChoosePlanForm() {
  // Default to test plan during pre-Stripe beta phase
  const [selectedPlan, setSelectedPlan] = useState('test');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const savePlanToProfile = async (planKey: string) => {
    try {
      console.log(`Saving plan selection: ${planKey}`);
      const response = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: planKey }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save plan');
      }

      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error('Error saving plan:', error);
      return { success: false, error };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage(null);

    try {
      console.log(`Submitting plan selection: ${selectedPlan}`);
      const result = await savePlanToProfile(selectedPlan);
      if (!result.success) throw new Error('Failed to save plan selection');
      console.log('Plan saved successfully:', result);

      // Attempt to refresh the session
      try {
        const refreshResponse = await fetch('/api/auth/refresh-session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log('[APA] Session refreshed:', refreshData?.user?.account?.plan);
        } else {
          await fetch('/api/auth/status', {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include',
          });
        }
      } catch (refreshErr) {
        console.error('Session refresh error:', refreshErr);
      }

      // Show success message for any plan
      setStatus('success');
      setMessage(`${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan activated! Redirecting to your dashboard...`);
      
      // Refresh Next.js router cache before redirect
      router.refresh();
      
      // For all plans, use a consistent redirect approach with a short delay
      // This gives time for the session to be properly updated
      setTimeout(() => {
        console.log('[APA] Redirecting to session-ping to confirm session is settled');
        const url = `/session-ping?t=${Date.now()}`;
        window.location.replace(url);
      }, 2000);
    } catch (err) {
      console.error('Plan selection error:', err);
      setStatus('error');
      setMessage('Something went wrong while saving your plan. Please try again.');
    }
  };

  // If no plans are available, show a message
  if (!PLANS || PLANS.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-4">No plans are currently available. Please try again later.</p>
        <button
          onClick={() => router.refresh()}
          className="py-2 px-4 bg-black text-white rounded hover:bg-gray-800"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  console.log('Available plans:', PLANS);

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto px-2 sm:px-0">
      <div className="flex justify-center mb-6 sm:mb-8">
        {PLANS.map((plan) => (
          <div key={plan.key} className="relative w-full max-w-md">
            <BaseCard
              onClick={() => setSelectedPlan(plan.key)}
              className={cn(
                'h-full transition-all hover:translate-y-[-2px]',
                selectedPlan === plan.key && 'ring-2 ring-black',
                plan.recommended && 'ring-1 ring-gray-400 bg-gray-50'
              )}
            >
              {plan.recommended && (
                <span className="absolute -top-2 left-4 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">{plan.label}</h3>
                <div className="mt-1 flex items-baseline">
                  <span className="text-xl sm:text-2xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-1 text-sm sm:text-base">/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-1 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-black mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setSelectedPlan(plan.key)}
                className={cn(
                  'w-full mt-auto py-2.5 sm:py-3 rounded transition-colors text-sm sm:text-base',
                  'bg-black text-white hover:bg-gray-800',
                  selectedPlan === plan.key && 'bg-black',
                  selectedPlan !== plan.key && 'bg-gray-800'
                )}
              >
                Choose Plan
              </button>
            </BaseCard>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full max-w-md mx-auto block py-3 px-6 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-70 transition-colors text-sm sm:text-base font-medium"
      >
        {status === 'loading' ? 'Processing...' : 'Confirm Selection'}
      </button>

      {message && status === 'success' && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded text-center">
          <p className="text-sm text-gray-800">{message}</p>
          <div className="mt-2">
            <div className="inline-block w-4 h-4 border-2 border-t-black border-r-black border-gray-300 rounded-full animate-spin"></div>
            <span className="ml-2 text-xs text-gray-600">Redirecting to dashboard...</span>
          </div>
        </div>
      )}

      {message && status === 'error' && (
        <p className="text-sm text-red-600 text-center mt-4">
          {message}
        </p>
      )}
    </form>
  );
}
