'use client';

// 🔐 APA-HARDENED by Aiden — Do not remove without review.
// This is the dashboard page that displays all cliqs the authenticated user is part of.
// API data is fetched client-side from `/api/my-cliqs-dashboard`.

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins text-center">My Cliqs</h1>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/cliqs/build">
          <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary transition">
            Create a Cliq
          </button>
        </Link>
        <Link href="/set-up-profile">
          <button className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition">
            Create Your Profile
          </button>
        </Link>
      </div>

      {cliqs.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Create your first cliq!</p>
          <p className="text-sm text-gray-400">Start building your private community.</p>
        </div>
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
      )}    </main>
  );
}
