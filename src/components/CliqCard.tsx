'use client';

// 🔐 APA-HARDENED — Cliq Card for Dashboard View
import Link from 'next/link';
import Image from 'next/image';
import BaseCard from '@/components/cards/BaseCard';
import { CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/Button';


interface CliqCardProps {
  cliq: {
    id: string;
    name: string;
    description?: string | null;
    privacy: string;
    coverImage?: string | null;
  };
}

export default function CliqCard({ cliq }: CliqCardProps) {
  const imageUrl = cliq.coverImage || '/placeholder-banner.jpg';

  return (
    <BaseCard>
      {/* Cover Image */}
      <div className="relative w-full h-40 rounded-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Cover for ${cliq.name}`}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Card Content */}
      <div className="pt-4 flex flex-col gap-3">
        <div>
          <CardTitle className="text-lg font-semibold">{cliq.name}</CardTitle>
          <p className="text-sm text-gray-600">Cliq Type: {cliq.privacy}</p>
        </div>

        <p className="text-sm text-neutral-700">
          {cliq.description || 'No description yet.'}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/cliqs/${cliq.id}`}>
            <Button variant="outline">View</Button>
          </Link>
          <Link href={`/cliqs/${cliq.id}/members`}>
            <Button variant="outline">Members</Button>
          </Link>
          <Link href={`/cliqs/${cliq.id}/invite`}>
            <Button variant="outline">Invite</Button>
          </Link>
        </div>
      </div>
    </BaseCard>
  );
}
