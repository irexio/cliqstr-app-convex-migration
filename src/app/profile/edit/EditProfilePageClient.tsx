'use client';

import { useState } from 'react';
import EditProfileForm from './EditProfileForm';
import AvatarUploader from '@/components/AvatarUploader';
import BannerUploader from '@/components/BannerUploader';

interface EditProfilePageClientProps {
  profile: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    about: string | null;
    image: string | null;
    bannerImage: string | null;
    birthdate: Date | null;
    showYear: boolean;
  };
}

export default function EditProfilePageClient({ profile }: EditProfilePageClientProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.image);
  const [bannerUrl, setBannerUrl] = useState<string | null>(profile.bannerImage);

  const userName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-1">Update your profile information</p>
          </div>
          
          {/* Avatar Uploader */}
          <div className="mb-8">
            <AvatarUploader 
              currentImage={profile.image}
              userName={userName}
              onImageChange={setAvatarUrl}
            />
          </div>

          {/* Banner Uploader */}
          <div className="mb-8">
            <BannerUploader 
              currentBanner={profile.bannerImage}
              onBannerChange={setBannerUrl}
            />
          </div>
          
          <EditProfileForm 
            profile={profile} 
            avatarUrl={avatarUrl}
            bannerUrl={bannerUrl}
          />
        </div>
      </div>
    </div>
  );
}
