'use client';

// 🔐 APA-HARDENED by Aiden — Do not remove or replace without APA review.
// This form renders the current subscription plan options and triggers Stripe checkout.
// Variant handling has been updated to avoid build-breaking type errors.
// Reviewed and approved by Mimi on 2025-06-19.

import { useState } from 'react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils'; // Ensure this exists or remove if not needed

const PLANS = [
  { key: 'starter', label: 'Starter (Free Trial)' },
  { key: 'standard', label: 'Standard' },
  { key: 'familyPlus', label: 'Family Plus' },
];

export default function ChoosePlanForm() {
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey: selectedPlan }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-center text-indigo-800">Choose Your Plan</h2>

      <div className="grid gap-4">
        {PLANS.map((plan) => (
          <Button
            key={plan.key}
            type="button"
            variant="outline"
            className={cn(
              'w-full transition',
              selectedPlan === plan.key && 'bg-indigo-600 text-white border-indigo-700'
            )}
            onClick={() => setSelectedPlan(plan.key)}
          >
            {plan.label}
          </Button>
        ))}
      </div>

      <Button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {status === 'loading' ? 'Redirecting to Stripe…' : 'Continue to Checkout'}
      </Button>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
