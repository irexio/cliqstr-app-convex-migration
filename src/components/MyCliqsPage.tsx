'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
      {cliqs.map((cliq) => (
        <Card key={cliq.id}>
          <CardHeader>
            <CardTitle>{cliq.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{cliq.description}</p>
            <p className="text-sm text-gray-500 mt-2">Privacy: {cliq.privacy}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
