'use client';

// 🔐 APA-HARDENED — Cliq Profile Client Component
// Renders cliq info passed from server (name, description, etc.)
// No API call — uses props only

interface CliqProfile {
  name: string;
  description?: string;
  bannerImage?: string;
}

interface CliqProfileContentProps {
  cliq: CliqProfile;
}

export default function CliqProfileContent({ cliq }: CliqProfileContentProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 p-6">
      {cliq.bannerImage && (
        <img
          src={cliq.bannerImage}
          alt="Cliq banner"
          className="w-full h-48 object-cover rounded-xl"
        />
      )}
      <h1 className="text-2xl font-bold">{cliq.name}</h1>
      {cliq.description && <p className="text-gray-600">{cliq.description}</p>}
    </div>
  );
}

