'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PermissionsModal() {
  const router = useRouter();
  const [dmAllowed, setDmAllowed] = useState(false);
  const [discoverable, setDiscoverable] = useState(false);
  const [maxDailyMinutes, setMaxDailyMinutes] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSave() {
    setErr(null); setSubmitting(true);
    const res = await fetch('/api/wizard/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permissions: { dmAllowed, discoverable, maxDailyMinutes }
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setErr(data?.message || data?.code || 'Unable to save permissions.');
      setSubmitting(false);
      return;
    }
    router.refresh(); // server will now switch to Success section
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold">Set your child's permissions</h2>
        <p className="mb-4 text-sm text-gray-600">
          You can update these anytime from Parents HQ.
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={dmAllowed}
              onChange={(e) => setDmAllowed(e.target.checked)}
            />
            <span>Allow direct messages</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={discoverable}
              onChange={(e) => setDiscoverable(e.target.checked)}
            />
            <span>Allow others to discover my child's profile</span>
          </label>

          <label className="block">
            <span className="block text-sm text-gray-700">Max daily minutes</span>
            <input
              type="number"
              min={10}
              max={600}
              step={5}
              value={maxDailyMinutes}
              onChange={(e) => setMaxDailyMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
        </div>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <div className="mt-6 flex gap-3">
          <button
            className="btn btn-primary flex-1"
            disabled={submitting}
            onClick={onSave}
            aria-busy={submitting ? 'true' : 'false'}
          >
            {submitting ? 'Saving…' : 'Save & finish'}
          </button>
        </div>
      </div>
    </div>
  );
}
