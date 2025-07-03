'use client';

// 🔐 APA-HARDENED — MyCliqsPage (client display only)
// Expects full list of user's cliqs passed from server
// No fetchJson — rendered via props only -062625 

import Link from 'next/link';
import CliqCard from '@/components/cards/CliqCard';

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
          <CliqCard key={cliq.id} cliq={cliq} />
        ))}
      </div>
    </div>
  );
}
