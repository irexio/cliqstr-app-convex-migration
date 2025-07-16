'use client';

// 🔐 APA-HARDENED by Aiden — Do not remove or replace without APA review.
// This form renders the current subscription plan options for Cliqstr users.
// Updated with new plan structure for simplified testing and deployment.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import CliqCard from '@/components/cliqs/CliqCard'; // Use if card wrapper is needed
import { cn } from '@/lib/utils';
import BaseCard from '@/components/cliqs/BaseCard';

// Updated plan structure matching new specifications
const PLANS = [
  { 
    key: 'test',
    label: 'Test Plan',
    price: '$0',
    period: 'mo',
    recommended: false,
    features: [
      'Up to 2 cliqs',
      '10 posts per cliq',
      'Posts auto-expire after 30 days'
    ]
  },
  { 
    key: 'basic',
    label: 'Basic Plan',
    price: '$5',
    period: 'mo',
    recommended: true,
    features: [
      '5 cliqs',
      '25 posts per cliq',
      'Auto-expire after 90 days'
    ]
  },
  { 
    key: 'premium',
    label: 'Premium Plan',
    price: '$10',
    period: 'mo',
    recommended: false,
    features: [
      '10 cliqs',
      '50 posts per cliq',
      '1 GB storage'
    ]
  },
  { 
    key: 'family',
    label: 'Family Plan',
    price: '$12',
    period: 'mo',
    recommended: false,
    features: [
      '3–5 users shared',
      '25 posts per cliq',
      '500 MB storage'
    ]
  },
  { 
    key: 'group',
    label: 'Group/Org',
    price: '$25+',
    period: 'mo',
    recommended: false,
    features: [
      '50 cliqs',
      '100 posts per cliq',
      '5 GB+ storage'
    ]
  }
];

export default function ChoosePlanForm() {
  const [selectedPlan, setSelectedPlan] = useState('basic'); // Default to recommended plan
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // Function to save plan to user profile through API
  const savePlanToProfile = async (planKey: string) => {
    try {
      console.log(`Saving plan selection: ${planKey}`);
      
      const response = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan: planKey
        })
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
      // Save the plan selection
      const result = await savePlanToProfile(selectedPlan);
      
      if (!result.success) {
        throw new Error('Failed to save plan selection');
      }
      
      // Force a session refresh by calling the auth status endpoint
      // This ensures the updated plan is reflected in the session
      try {
        const refreshResponse = await fetch('/api/auth/refresh-session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log('Session refreshed successfully:', refreshData.user?.account?.plan);
        }
      } catch (refreshErr) {
        console.error('Session refresh error:', refreshErr);
        // Continue anyway, as the plan was saved
      }
      
      // Special case for Test/Free Plan - apply immediately
      if (selectedPlan === 'test') {
        // Refresh session and redirect to dashboard
        router.refresh(); // Refresh Next.js router cache
        router.push(`/my-cliqs-dashboard?auth=true&plan=test&t=${Date.now()}`);
        return;
      }
      
      // For paid plans, we'll show a message about Stripe integration
      // In the future, this would redirect to Stripe checkout
      setStatus('success');
      setMessage("Stripe integration coming soon. You've selected your plan — access will be upgraded soon.");
      
      // Redirect after showing message briefly
      setTimeout(() => {
        console.log('Paid plan selected - redirecting to dashboard');
        // Refresh Next.js router cache before redirect
        router.refresh();
        // Use router.push for better session handling
        router.push(`/my-cliqs-dashboard?auth=true&plan=${selectedPlan}&t=${Date.now()}`);
      }, 3500);
      
    } catch (err) {
      console.error('Plan selection error:', err);
      setStatus('error');
      setMessage('Something went wrong while saving your plan. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto">
      {/* Plan grid - 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {PLANS.map((plan) => (
          <div key={plan.key} className="relative">
            <BaseCard 
              onClick={() => setSelectedPlan(plan.key)}
              className={cn(
                'h-full transition-all hover:translate-y-[-2px]',
                selectedPlan === plan.key && 'ring-2 ring-black',
                plan.recommended && 'ring-1 ring-gray-400 bg-gray-50'
              )}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <span className="absolute -top-2 left-4 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              
              {/* Plan header */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{plan.label}</h3>
                <div className="mt-1 flex items-baseline">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-1">/{plan.period}</span>
                </div>
              </div>
              
              {/* Feature list */}
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-black mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Choose button */}
              <button
                type="button"
                onClick={() => setSelectedPlan(plan.key)}
                className={cn(
                  'w-full mt-auto py-2 rounded transition-colors',
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

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full max-w-md mx-auto block py-3 px-6 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-70 transition-colors"
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
