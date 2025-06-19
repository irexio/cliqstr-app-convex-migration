'use client';

// 🔐 APA-HARDENED by Aiden — Do not remove without review.
// This is the dashboard page that displays all cliqs the authenticated user is part of.
// API data is fetched client-side from `/api/my-cliqs-dashboard`.

import { useEffect, useState } from 'react';

interface Cliq {
  id: string;
  name: string;
  description: string | null;
  privacy: string;
  createdAt: string;
  ownerId: string;
}

export default function MyCliqsPage() {
  const [cliqs, setCliqs] = useState<Cliq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCliqs() {
      try {
        const res = await fetch('/api/my-cliqs-dashboard');
        const data = await res.json();
        if (res.ok) {
          setCliqs(data.cliqs);
        } else {
          throw new Error(data.error || 'Failed to load cliqs');
        }
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    }

    fetchCliqs();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading your cliqs...</p>;

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold text-center">My Cliqs</h1>
      {cliqs.length === 0 ? (
        <p className="text-center text-gray-500">You're not in any cliqs yet.</p>
      ) : (
        <ul className="space-y-4">
          {cliqs.map((cliq) => (
            <li
              key={cliq.id}
              className="border rounded p-4 hover:bg-indigo-50 transition"
            >
              <h2 className="text-lg font-semibold">{cliq.name}</h2>
              <p className="text-sm text-gray-600">
                {cliq.description || 'No description.'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Privacy: {cliq.privacy}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
