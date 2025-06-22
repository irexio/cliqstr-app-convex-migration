'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupProfileClient({ userId }: { userId: string }) {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [invitedRole, setInvitedRole] = useState('');
  const [cliqId, setCliqId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load invite data from sessionStorage on mount
  useEffect(() => {
    const code = sessionStorage.getItem('inviteCode');
    const role = sessionStorage.getItem('invitedRole');
    const cliq = sessionStorage.getItem('cliqId');

    if (code && role && cliq) {
      setInviteCode(code);
      setInvitedRole(role);
      setCliqId(cliq);
    } else {
      router.push('/sign-up');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !birthdate) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sign-up/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username,
          birthdate,
          inviteCode,
          cliqId,
          invitedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete sign-up.');
      }

      console.log('[✅] Signed up:', data);
      router.push('/my-cliqs');
    } catch (err: any) {
      console.error('[❌] Signup error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Finish Setting Up</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow border">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a fun name"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Birthdate</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {inviteCode && (
          <div className="text-sm text-gray-600">
            Joining <strong>{cliqId}</strong> as <strong>{invitedRole}</strong> via code{' '}
            <code>{inviteCode}</code>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm"
        >
          {loading ? 'Finishing...' : 'Create My Profile'}
        </button>
      </form>
    </main>
  );
}
