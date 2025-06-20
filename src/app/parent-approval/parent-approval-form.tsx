'use client';

// 🔐 APA-HARDENED by Aiden — Sends parent approval email using /api/send-parent-email.
// Uses Resend and confirms success/failure with user-friendly feedback.

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/Button';

export default function ParentApprovalForm() {
  const [parentEmail, setParentEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/send-parent-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail,
          childName: 'Test Child', // 🔧 Replace with dynamic name when connected to user session
          isInvited: false,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('❌ Email failed:', err.message);
      setError(err.message || 'An unexpected error occurred.');
    }

    setLoading(false);
  };

  return submitted ? (
    <p className="text-green-600 font-semibold mt-6">
      ✅ Thanks! Your parent will get an email shortly with the next steps.
    </p>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Label>Parent’s Email</Label>
      <Input
        type="email"
        value={parentEmail}
        onChange={(e) => setParentEmail(e.target.value)}
        placeholder="parent@example.com"
        required
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" className="w-full mt-4" disabled={loading}>
        {loading ? 'Sending Email...' : 'Send Parent Email'}
      </Button>
    </form>
  );
}
