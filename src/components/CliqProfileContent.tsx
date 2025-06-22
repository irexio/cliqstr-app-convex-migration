'use client';

import { useEffect, useState } from 'react';

interface Cliq {
  id: string;
  name: string;
  description: string;
  privacy: string;
}

export default function CliqProfileContent({ cliqId }: { cliqId: string }) {
  const [cliq, setCliq] = useState<Cliq | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCliq = async () => {
      try {
        const res = await fetch(`/api/cliqs/${cliqId}`);
        const data = await res.json();
        setCliq(data.cliq || null);
      } catch (err) {
        console.error('Failed to load cliq', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCliq();
  }, [cliqId]);

  if (loading) {
    return <div className="p-6 text-center">Loading cliq info...</div>;
  }

  if (!cliq) {
    return <div className="p-6 text-center text-red-600">Cliq not found.</div>;
  }

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">{cliq.name}</h1>
      <p className="text-gray-700">{cliq.description}</p>
      <p className="text-sm text-gray-500">Privacy: {cliq.privacy}</p>
    </div>
  );
}
