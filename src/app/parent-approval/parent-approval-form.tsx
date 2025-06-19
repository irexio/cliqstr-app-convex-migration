'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ParentApprovalForm({
  childId,
  inviteCode,
  username,
  parentEmail,
  password,
  cliqName,
}: {
  childId: string;
  inviteCode: string;
  username: string;
  parentEmail: string;
  password: string;
  cliqName: string;
}) {
  const router = useRouter();

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async (plan: 'free' | 'paid' | 'ebt') => {
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/complete-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode,
          childId,
          username,
          password,
          parentEmail,
          plan,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Approval failed');

      setMessage(
        plan === 'ebt'
          ? 'Request received! We’ll review it within 24 hours.'
          : 'Access granted! Redirecting...'
      );

      setTimeout(() => {
        router.push('/my-cliqs');
      }, plan === 'ebt' ? 4000 : 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white border shadow rounded space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700 text-center">Parental Approval</h1>

      <p className="text-sm text-gray-700">
        Your child <strong>{username}</strong> has been invited to join{' '}
        <strong>{cliqName}</strong> on Cliqstr — a safe, private space for families.
      </p>

      <p className="text-sm text-gray-700">
        All children under 18 require parent approval. Please choose your preferred access option:
      </p>

      <div className="space-y-4">
        <button
          onClick={() => handleApprove('free')}
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2 rounded text-sm hover:bg-indigo-700"
        >
          Approve Free Plan
        </button>

        <button
          onClick={() => handleApprove('paid')}
          disabled={submitting}
          className="w-full bg-purple-600 text-white py-2 rounded text-sm hover:bg-purple-700"
        >
          Approve & Upgrade Plan
        </button>

        <button
          onClick={() => handleApprove('ebt')}
          disabled={submitting}
          className="w-full bg-gray-100 text-gray-800 py-2 rounded text-sm hover:bg-gray-200"
        >
          I have EBT/SNAP – Request Free Access
        </button>
      </div>

      {message && <p className="text-sm text-green-700 text-center">{message}</p>}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <p className="text-xs text-gray-400 text-center mt-4">
        EBT/SNAP requests will be reviewed within 24 hours. Your card will not be charged.
      </p>
    </div>
  );
}
