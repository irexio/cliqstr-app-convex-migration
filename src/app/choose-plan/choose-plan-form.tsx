'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';

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
            variant={selectedPlan === plan.key ? 'solid' : 'outline'} // ✅ fixed here
            className="w-full"
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
