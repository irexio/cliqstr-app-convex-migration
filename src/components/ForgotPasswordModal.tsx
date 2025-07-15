'use client';

// 🔐 APA-HARDENED FORGOT PASSWORD MODAL FOR CLIQSTR
// Uses direct POST to /auth/reset-password (no /api/)

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';

export default function ForgotPasswordModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error(await res.text());

      setStatus('success');
    } catch (err: any) {
      console.error('❌ Reset email error:', err);
      setStatus('error');
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="fixed z-50 inset-0 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md text-black">
        <Dialog.Title className="text-xl font-semibold mb-4">
          Reset Your Password
        </Dialog.Title>

        {status === 'success' ? (
          <p className="text-green-600">
            Check your email for a password reset link.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Enter your email and we’ll send you a reset link.
            </p>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-4"
            />
            {status === 'error' && (
              <p className="text-red-500 text-sm mb-2">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Send Reset Link</Button>
            </div>
          </>
        )}
      </Dialog.Panel>
    </Dialog>
  );
}
