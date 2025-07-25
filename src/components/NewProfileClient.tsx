'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { UploadButton } from '@/lib/uploadthing-client';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import ScrapbookGallery from './ScrapbookGallery';
import { getAgeGroup } from '@/lib/ageUtils';

// Add force-dynamic to ensure fresh data
export const dynamic = 'force-dynamic';

type ProfileProps = {
  profile: {
    id: string;
    name: string;
    username: string;
    birthdate: string;
    bio: string;
    avatarUrl?: string;
    bannerUrl?: string;
    isOwner: boolean;
    canViewGallery: boolean;
    galleryLayoutStyle?: 'inline' | 'masonry'; // Added layout style preference
  };
  scrapbookItems: Array<{
    id: string;
    imageUrl: string;
    caption: string;
    createdAt: Date;
    isPinned: boolean;
  }>;
  onRefresh?: () => void;
};

export default function ProfileClient({
  profile,
  scrapbookItems,
  onRefresh,
}: ProfileProps) {
  const [data, setData] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // Get the appropriate label for the scrapbook section based on age group
  const { group } = getAgeGroup(profile.birthdate);
  const sectionLabel = group === 'child' ? 'Show & Tell' : 'Scrapbook';
  
  // Set default layout style based on age group - inline for children, user preference for others
  // Always use inline for children for predictability and safety
  const defaultLayoutStyle = group === 'child' ? 'inline' : (profile.galleryLayoutStyle || 'inline');

  const handleChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  const handleSave = async () => {
    try {
      console.log('[PROFILE] Saving profile changes:', data);
      
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          about: data.bio,
          image: data.avatarUrl,
          bannerImage: data.bannerUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('[PROFILE] Update successful:', result);
      
      // Close the edit modal
      setIsEditing(false);
      
      // Refresh the profile data if a callback was provided
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('[PROFILE] Update error:', error);
      alert('Failed to update profile: ' + (error as Error).message);
    }
  };

  return (
    <main className="max-w-4xl mx-auto pb-16">
      {/* Banner Section */}
      <div className="relative h-48 sm:h-60 md:h-72 lg:h-80 w-full">
        <Image
          src={data.bannerUrl || '/images/default-banner.jpg'}
          alt="Profile banner"
          fill
          className="object-cover rounded-t-lg"
          priority
        />
        
        {/* Banner Upload Button (only visible to profile owner) */}
        {data.isOwner && !uploadingBanner && (
          <button
            onClick={() => setUploadingBanner(true)}
            className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow hover:bg-white transition"
            aria-label="Change banner image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        )}
        
        {/* Banner Upload Component */}
        {data.isOwner && uploadingBanner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-t-lg">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full m-4">
              <h3 className="font-medium mb-3">Upload New Banner</h3>
              <UploadButton
                endpoint="banner"
                onClientUploadComplete={(res) => {
                  console.log('[PROFILE_EDIT] Banner upload complete:', res);
                  setUploadingBanner(false);
                  if (res && res.length > 0) {
                    const fileUrl = res[0].url || res[0].fileUrl;
                    console.log('[PROFILE_EDIT] Setting banner URL:', fileUrl);
                    setData({ ...data, bannerUrl: fileUrl });
                    handleChange('bannerUrl', fileUrl);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error('Upload error:', error);
                  setUploadingBanner(false);
                }}
                className="ut-button:bg-black ut-button:ut-readying:bg-gray-500 ut-button:ut-uploading:bg-gray-500"
              />
              <button
                onClick={() => setUploadingBanner(false)}
                className="w-full mt-3 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="flex flex-col items-center px-4 pt-16 pb-8 bg-white -mt-1">
        {/* Avatar Section with Upload Button */}
        <div className="relative -mt-32 w-40 h-40">
          <div className="w-full h-full rounded-full border-4 border-white overflow-hidden shadow-lg">
            <Image
              src={data.avatarUrl || '/images/default-avatar.png'}
              alt="Profile picture"
              width={160}
              height={160}
              className="object-cover w-full h-full"
            />
          </div>
          
          {/* Avatar Upload Button (only visible to profile owner) */}
          {data.isOwner && !uploadingAvatar && (
            <button
              onClick={() => setUploadingAvatar(true)}
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition border border-gray-200"
              aria-label="Change profile picture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}
        </div>
        
        {/* Avatar Upload Component */}
        {data.isOwner && uploadingAvatar && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full m-4">
              <h3 className="font-medium mb-4">Upload New Profile Picture</h3>
              <UploadButton
                endpoint="avatar"
                onClientUploadComplete={(res) => {
                  console.log('[PROFILE_EDIT] Avatar upload complete:', res);
                  setUploadingAvatar(false);
                  if (res && res.length > 0) {
                    const fileUrl = res[0].url || res[0].fileUrl;
                    console.log('[PROFILE_EDIT] Setting avatar URL:', fileUrl);
                    setData({ ...data, avatarUrl: fileUrl });
                    handleChange('avatarUrl', fileUrl);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error('Upload error:', error);
                  setUploadingAvatar(false);
                }}
                className="ut-button:bg-black ut-button:ut-readying:bg-gray-500 ut-button:ut-uploading:bg-gray-500"
              />
              <button
                onClick={() => setUploadingAvatar(false)}
                className="w-full mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="text-center mt-6">
          <h1 className="text-4xl font-bold text-gray-900">{data.name}</h1>
          <p className="text-lg text-gray-500 mt-1">@{data.username}</p>
          <p className="text-base text-gray-600 mt-3">Birthday: {new Date(data.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </div>

        {/* About Section */}
        <div className="mt-8 text-center max-w-2xl mx-auto px-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-600 text-base leading-relaxed">{data.bio || "No bio yet"}</p>
        </div>

        {/* Edit Profile Button (only visible to profile owner) */}
        {data.isOwner && (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-8 px-6 py-2.5 bg-[#6366f1] text-white rounded-full text-sm font-medium hover:bg-[#5558e3] transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* Scrapbook/Show & Tell Section (only visible if canViewGallery is true) */}
      {profile.canViewGallery && (
        <div className="mt-8 px-4 pb-8">
          <ScrapbookGallery
            items={scrapbookItems}
            userId={profile.id}
            isOwner={profile.isOwner}
            sectionLabel={sectionLabel}
            layoutStyle={defaultLayoutStyle}
            onItemAdded={onRefresh}
          />
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-lg p-6 space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold">Edit Profile</h2>

            <div className="space-y-2">
              <label className="block text-sm">Display Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Username</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 rounded-l-md border border-r-0 border-gray-300">
                  @
                </span>
                <input
                  type="text"
                  value={data.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="w-full border rounded-r-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Birthday</label>
              <input
                type="date"
                value={data.birthdate}
                onChange={(e) => handleChange('birthdate', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">About Me</label>
              <textarea
                value={data.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Tell others about yourself..."
              />
            </div>

            {/* Gallery Layout Style Selection (only for teens/adults) */}
            {group !== 'child' && (
              <div className="space-y-2">
                <label className="block text-sm">{sectionLabel} Layout Style</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="layoutStyle"
                      checked={!data.galleryLayoutStyle || data.galleryLayoutStyle === 'inline'}
                      onChange={() => handleChange('galleryLayoutStyle', 'inline')}
                      className="h-4 w-4 text-black"
                    />
                    <span className="text-sm">Standard Grid</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="layoutStyle"
                      checked={data.galleryLayoutStyle === 'masonry'}
                      onChange={() => handleChange('galleryLayoutStyle', 'masonry')}
                      className="h-4 w-4 text-black"
                    />
                    <span className="text-sm">Pinterest Style</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Choose how your {sectionLabel.toLowerCase()} is displayed to others</p>
              </div>
            )}
            

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
