// 🔐 APA-HARDENED by Aiden — Safe for controlled display only.
// This card accepts only validated props from parent — no client fetching here.
// All cliq visibility rules (age, approval, role, etc.) must be enforced at the parent level.
// Do not bind mutation logic to onJoin unless role-checked in parent.

'use client';

import Image from 'next/image';

type Props = {
  imageUrl: string;
  title: string;
  memberCount: number;
  onJoin?: () => void; // Must be role-validated in parent if used
};

export default function PublicCliqCard({
  imageUrl,
  title,
  memberCount,
  onJoin,
}: Props) {
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
        <h3 className="text-lg font-semibold text-neutral-900">
          {title}
        </h3>
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
