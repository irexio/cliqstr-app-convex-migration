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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-600 mt-1">Update your profile information and photos</p>
          </div>

          {/* Banner Upload */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Banner Image</h2>
            <BannerUploader 
              currentBanner={bannerUrl}
              onBannerChange={setBannerUrl}
            />
          </div>

          {/* Avatar Upload */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Profile Photo</h2>
            <AvatarUploader 
              currentImage={avatarUrl}
              onImageChange={setAvatarUrl}
            />
          </div>

          {/* Profile Form */}
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
