'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChildCreateModalProps {
  inviteId?: string;
}

export default function ChildCreateModal({ inviteId }: ChildCreateModalProps) {
  const router = useRouter();
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
      username: (fd.get('username') as string)?.trim(),
      password: (fd.get('password') as string) || '',
      birthdate: (fd.get('birthdate') as string) || '',
      inviteId: inviteId,
    };

    try {
      const res = await fetch('/api/parent/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErr(data?.message || data?.reason || 'Unable to create child account. Please try again.');
        setSubmitting(false);
        return;
      }

      // Success - refresh to show next step
      router.refresh();
    } catch (e) {
      setErr('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 py-8">
      <div className="max-w-md mx-auto px-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Create your child's account
        </h2>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input 
              name="firstName" 
              placeholder="Child's first name" 
              required 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            <input 
              name="lastName" 
              placeholder="Child's last name" 
              required 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          
          <input
            name="username"
            placeholder="Username for your child"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            pattern="[a-zA-Z0-9_]+"
            title="Username can only contain letters, numbers, and underscores"
          />
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Child's birthdate</label>
            <input
              name="birthdate"
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              max={new Date().toISOString().slice(0,10)}
            />
          </div>
          
          <input
            name="password"
            type="password"
            placeholder="Create password for your child"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="new-password"
            minLength={8}
          />

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p><strong>Note:</strong> Your child will be able to customize their profile (nickname, avatar, etc.) after their account is created.</p>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating child account…' : 'Create child account'}
          </button>
        </form>
      </div>
    </div>
  );
}
