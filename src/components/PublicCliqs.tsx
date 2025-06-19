'use client';

import Image from 'next/image';

type Props = {
  imageUrl: string;
  title: string;
  memberCount: number;
  onJoin?: () => void;
};

export default function PublicCliqCard({ imageUrl, title, memberCount, onJoin }: Props) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="relative w-full h-40">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-600">{memberCount} members</p>

        <button
          onClick={onJoin}
          className="w-full mt-4 text-sm bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-secondary transition"
        >
          Join Cliq
        </button>
      </div>
    </div>
  );
}
