'use client';

// 🔐 APA-HARDENED — Cliq Profile Client Component
// Renders cliq info passed from server (name, description, etc.)
// No API call — uses props only

interface CliqProfile {
  name: string;
  description?: string;
  bannerImage?: string;
  privacy?: string;
  memberCount?: number;
}

interface CliqProfileContentProps {
  cliq: CliqProfile;
}

export default function CliqProfileContent({ cliq }: CliqProfileContentProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {cliq.bannerImage && (
        <img
          src={cliq.bannerImage}
          alt="Cliq banner"
          className="w-full h-48 object-cover rounded-xl"
        />
      )}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">{cliq.name}</h1>
        {cliq.description && <p className="text-gray-600">{cliq.description}</p>}
        
        {/* Cliq Status */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="font-medium">
              {cliq.privacy === 'private' ? 'Private' : 
               cliq.privacy === 'public' ? 'Public' : 
               cliq.privacy === 'semi' ? 'Semi-Private' : 'Private'} Cliq
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>{cliq.memberCount || 0} members</span>
          </div>
        </div>
      </div>
    </div>
  );
}

