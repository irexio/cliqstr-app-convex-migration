'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/Button';

interface CliqCardProps {
  cliq: {
    id: string;
    name: string;
    description?: string | null;
    privacy: string;
    coverImage?: string | null; // Add this to pull in uploaded image
  };
}

export default function CliqCard({ cliq }: CliqCardProps) {
  const imageUrl = cliq.coverImage || '/placeholder-banner.jpg';

  return (
    <Card className="flex flex-col justify-between shadow-md">
      <CardHeader className="p-0">
        <div className="relative w-full h-40 rounded-t overflow-hidden">
          <Image
            src={imageUrl}
            alt="Cliq banner"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-3">
        <div>
          <CardTitle className="text-lg font-semibold">{cliq.name}</CardTitle>
          <p className="text-sm text-gray-600">Cliq Type: {cliq.privacy}</p>
        </div>

        <p className="text-sm text-neutral-700">
          {cliq.description || 'No description yet.'}
        </p>

        <div className="flex gap-2 mt-auto">
          <Link href={`/cliqs/${cliq.id}`}>
            <Button variant="outline">View</Button>
          </Link>
          <Link href={`/cliqs/${cliq.id}/members`}>
            <Button variant="outline">Members</Button>
          </Link>
          <Link href={`/cliqs/${cliq.id}/invite-request`}>
            <Button variant="outline">Invite</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
