'use client';

// 🔐 APA-HARDENED — MyCliqsPage (client display only)
// Expects full list of user's cliqs passed from server
// No fetchJson — rendered via props only -062625 

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

interface MyCliqsPageProps {
  cliqs: {
    id: string;
    name: string;
    description: string;
    privacy: string;
    createdAt: string;
    ownerId: string;
    bannerImage?: string;
  }[];
}

export default function MyCliqsPage({ cliqs }: MyCliqsPageProps) {
  if (!cliqs.length) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">My Cliqs</h1>
        <p className="text-sm text-neutral-500">
          New here? You can{' '}
          <Link href="/cliqs/build" className="text-[#c032d1] underline font-medium">
            create your first cliq
          </Link>{' '}
          or{' '}
          <Link href="/profile/setup" className="text-[#c032d1] underline font-medium">
            set up your profile
          </Link>{' '}
          to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Cliqs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cliqs.map((cliq) => (
          <Card key={cliq.id} className="flex flex-col justify-between overflow-hidden border border-gray-200">
            {cliq.bannerImage && (
              <div className="relative w-full h-28">
                <Image
                  src={cliq.bannerImage}
                  alt={`${cliq.name} banner`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{cliq.name}</CardTitle>
              <p className="text-sm text-gray-500 capitalize">{cliq.privacy} Cliq</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-700 mb-4">
                {cliq.description || 'No description yet.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <Link
                  href={`/cliqs/${cliq.id}`}
                  className="px-4 py-2 bg-black text-white text-sm rounded hover:text-[#c032d1] transition"
                >
                  View
                </Link>
                <Link
                  href={`/cliqs/${cliq.id}/members`}
                  className="px-4 py-2 bg-black text-white text-sm rounded hover:text-[#c032d1] transition"
                >
                  Members
                </Link>
                <Link
                  href={`/cliqs/${cliq.id}/invite-request`}
                  className="px-4 py-2 bg-black text-white text-sm rounded hover:text-[#c032d1] transition"
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
