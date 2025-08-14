'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ParentSignupModal({
  prefillEmail = '',
}: { prefillEmail?: string }) {
  const router = useRouter();
  const qs = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: (fd.get('firstName') as string)?.trim(),
      lastName: (fd.get('lastName') as string)?.trim(),
      email: ((fd.get('email') as string) || '').trim().toLowerCase(),
      birthdate: (fd.get('birthdate') as string) || '', // YYYY-MM-DD
      password: (fd.get('password') as string) || '',
    };

    try {
      const res = await fetch('/api/wizard/parent-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials not needed; cookie is HttpOnly and already set by /invite/accept
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErr(data?.message || data?.code || 'Unable to sign up. Please try again.');
        setSubmitting(false);
        return;
      }

      // ✅ advance wizard: server will pick the next step
      router.refresh();
    } catch (e) {
      setErr('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-xl font-semibold">Create your Parent account</h2>

        <div className="grid gap-3">
          <input name="firstName" placeholder="First name" required className="input" />
          <input name="lastName" placeholder="Last name" required className="input" />
          <input
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={prefillEmail}
            required
            className="input"
            autoComplete="username"
          />
          <label className="text-sm text-gray-600">Birthdate</label>
          <input
            name="birthdate"
            type="date"
            required
            className="input"
            // optional: min/max to keep it reasonable for adults
            max={new Date().toISOString().slice(0,10)}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="input"
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary mt-4 w-full"
          aria-busy={submitting ? 'true' : 'false'}
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-3 text-xs text-gray-500">
          By continuing you agree to the APA rules and our Terms.
        </p>
      </form>
    </div>
  );
}
