'use client';

// 🔐 APA-HARDENED — MyCliqsPage (client display only)
// Expects full list of user's cliqs passed from server
// No fetchJson — rendered via props only -062625 

import Link from 'next/link';
import CliqCard from '@/components/cards/CliqCard';
import { Button } from '@/components/Button';

interface MyCliqsPageProps {
  cliqs: {
    id: string;
    name: string;
    description: string;
    privacy: string;
    createdAt: string;
    ownerId: string;
    bannerImage?: string;
    coverImage?: string; // Optional if your CliqCard uses this
  }[];
}

export default function MyCliqsPage({ cliqs }: MyCliqsPageProps) {
  if (!cliqs.length) {
    return (
      <div className="pt-12 pb-8 max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-center">Welcome to Cliqstr!</h1>
        <p className="text-lg text-neutral-700 mb-8 text-center">
          Let’s get you started — create a profile or start your first cliq.
        </p>
        <div className="flex flex-row gap-6 justify-center">
          <Link href="/profile/create">
            <Button className="bg-black text-white hover:bg-gray-900">Create Your Profile</Button>
          </Link>
          <Link href="/cliqs/build">
            <Button className="bg-black text-white hover:bg-gray-900">Create New Cliq</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Cliqs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cliqs.map((cliq) => (
          <CliqCard key={cliq.id} cliq={cliq} />
        ))}
      </div>
    </div>
  );
}
