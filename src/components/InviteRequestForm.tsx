'use client';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/invite/create', {
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

      if (res.ok) {
        router.push('/invite-request/sent');
      } else {
        console.error('Invite request failed');
      }
    } catch (err) {
      console.error(err);
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

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Sending Request...' : 'Send to Parent for Approval'}
      </Button>
    </form>
  );
}
