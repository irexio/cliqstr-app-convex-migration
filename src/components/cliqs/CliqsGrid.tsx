'use client';

import { useState } from 'react';
import CliqCard from '@/components/cliqs/CliqCard';

interface CliqsGridProps {
  initialCliqs: {
    id: string;
    name: string;
    description?: string | null;
    privacy: string;
    coverImage?: string | null;
    ownerId?: string;
  }[];
  currentUserId: string;
}

export default function CliqsGrid({ initialCliqs, currentUserId }: CliqsGridProps) {
  const [cliqs, setCliqs] = useState(initialCliqs);

  const handleDeleteCliq = (cliqId: string) => {
    console.log('Removing cliq from UI:', cliqId);
    setCliqs(prevCliqs => prevCliqs.filter(cliq => cliq.id !== cliqId));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cliqs.map((cliq) => (
        <CliqCard 
          key={cliq.id} 
          cliq={cliq} 
          currentUserId={currentUserId}
          onDelete={handleDeleteCliq}
        />
      ))}
    </div>
  );
}
