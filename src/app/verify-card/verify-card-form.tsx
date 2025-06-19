'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function InnerCardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('clientSecret');

  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('verifying');

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe is not fully loaded or missing client secret.');
      setStatus('idle');
      return;
    }

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      setError(result.error.message || 'Card verification failed.');
      setStatus('idle');
    } else {
      setStatus('success');
      router.push('/choose-plan');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4">
      <h1 className="text-2xl font-bold text-center text-indigo-700">
        Verify Your Card
      </h1>
      <p className="text-sm text-gray-600 text-center">
        To protect kids and prevent abuse, we verify that a real adult is authorizing this account.
        You will not be charged unless you choose a plan.
      </p>

      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#32325d',
              '::placeholder': {
                color: '#a0aec0',
              },
            },
            invalid: {
              color: '#e53e3e',
            },
          },
        }}
      />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        disabled={status === 'verifying'}
      >
        {status === 'verifying' ? 'Verifying…' : 'Submit Card'}
      </button>
    </form>
  );
}

export default function VerifyCardForm() {
  return (
    <Elements stripe={stripePromise}>
      <InnerCardForm />
    </Elements>
  );
}
