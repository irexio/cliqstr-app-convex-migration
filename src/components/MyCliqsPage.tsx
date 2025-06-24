'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface MyCliqsPageProps {
  userId: string;
}

interface Cliq {
  id: string;
  name: string;
  description: string;
  privacy: string;
  createdAt: string;
  ownerId: string;
}

export default function MyCliqsPage({ userId }: MyCliqsPageProps) {
  const [cliqs, setCliqs] = useState<Cliq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCliqs = async () => {
      const res = await fetch('/api/my-cliqs');
      const data = await res.json();
      setCliqs(data.cliqs || []);
      setLoading(false);
    };

    fetchCliqs();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading your cliqs...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">My Cliqs</h1>

      {/* First-Time Tip */}
      {cliqs.length === 0 && (
        <p className="text-sm text-neutral-500 mb-6">
          New here? You can{' '}
          <Link href="/cliqs/build" className="text-[#c03194] underline font-medium">
            create your first cliq
          </Link>{' '}
          or{' '}
          <Link href="/profile/setup" className="text-[#c03194] underline font-medium">
            set up your profile
          </Link>{' '}
          to get started!
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cliqs.map((cliq) => (
          <Card key={cliq.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg">{cliq.name}</CardTitle>
              <p className="text-sm text-gray-500">{cliq.privacy} Cliq</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-700 mb-4">{cliq.description}</p>
              <div className="flex gap-2 mt-auto">
                <Link
                  href={`/cliqs/${cliq.id}`}
                  className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
                >
                  View
                </Link>
                <Link
                  href={`/cliqs/${cliq.id}/members`}
                  className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
                >
                  Members
                </Link>
                <Link
                  href={`/cliqs/${cliq.id}/invite-request`}
                  className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
                >
                  Invite
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
