'use client';

// 🔐 APA-HARDENED — Invite Request Form (with role + message)
// POSTs to /cliqs/[id]/invite — no /api/ dependency

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface InviteRequestFormProps {
  cliqId: string;
  inviterId: string;
}

export default function InviteRequestForm({ cliqId, inviterId }: InviteRequestFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'child' | 'adult'>('child');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/cliqs/${cliqId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliqId,
          invitedRole: role,
          inviterId,
          inviteeEmail: email,
          message,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      router.push('/invite-request/sent');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email">Friend’s Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <Label>Who are they?</Label>
        <RadioGroup value={role} onValueChange={(val) => setRole(val as 'child' | 'adult')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="child" id="child" />
            <Label htmlFor="child">A Kid</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="adult" id="adult" />
            <Label htmlFor="adult">An Adult</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="message">Optional Note</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell your parent why you want to invite them"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Sending Request...' : 'Send to Parent for Approval'}
      </Button>
    </form>
  );
}
