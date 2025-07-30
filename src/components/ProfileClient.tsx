'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UploadDropzone, UploadButton } from '@/lib/uploadthing-client';
import ScrapbookGallery from './ScrapbookGallery';
import { getAgeGroup } from '@/lib/ageUtils';

interface ProfileProps {
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
    showYear?: boolean;
    accountBirthdate?: string; // Immutable birthdate for age verification
    accountRole?: string;
  };
  scrapbookItems: Array<{
    id: string;
    imageUrl: string;
    caption: string;
    createdAt: Date;
    isPinned: boolean;
  }>;
  onRefresh?: () => void;
}

export default function ProfileClient({ profile, scrapbookItems, onRefresh }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'wall'>('wall');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [profileData, setProfileData] = useState(profile);

  // Use Account birthdate for age verification, NEVER Profile birthdate
  const { group } = getAgeGroup(profile.accountBirthdate || profile.birthdate);
  const sectionLabel = group === 'child' ? 'Show & Tell' : 'My Wall';



  const handleProfileUpdate = async (updates: any) => {
    try {
      console.log('[PROFILE] Updating profile with:', updates);
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      console.log('[PROFILE] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[PROFILE] Update failed:', errorText);
        throw new Error(`Failed to update profile: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('[PROFILE] Update successful:', result);
      
      // Map API fields to local state fields
      const stateUpdates = { ...updates };
      if (updates.about !== undefined) {
        stateUpdates.bio = updates.about;
        delete stateUpdates.about;
      }
      if (updates.image !== undefined) {
        stateUpdates.avatarUrl = updates.image;
        delete stateUpdates.image;
      }
      if (updates.bannerImage !== undefined) {
        stateUpdates.bannerUrl = updates.bannerImage;
        delete stateUpdates.bannerImage;
      }

      if (updates.showYear !== undefined) {
        stateUpdates.showYear = updates.showYear;
      }
      setProfileData({ ...profileData, ...stateUpdates });
      setIsEditingProfile(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('[PROFILE] Error updating profile:', error);
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    await handleProfileUpdate({ image: url });
    setIsUploadingAvatar(false);
  };

  const handleBannerUpload = async (url: string) => {
    await handleProfileUpdate({ bannerImage: url });
    setIsUploadingBanner(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-8">
      {/* Banner Section */}
      <div className="relative h-60 bg-gradient-to-r from-gray-100 to-gray-200">
        {profileData.bannerUrl ? (
          <Image
            src={profileData.bannerUrl}
            alt="Cover photo"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400" />
        )}
        
        {/* Banner Upload Button */}
        {profileData.isOwner && (
          <div className="absolute top-4 right-4 z-10">
            <UploadButton
              endpoint="banner"
              onClientUploadComplete={(res: any) => {
                console.log('[PROFILE] Banner upload complete:', res);
                if (res && res[0]?.url) {
                  handleBannerUpload(res[0].url);
                }
                setIsUploadingBanner(false);
              }}
              onUploadError={(err: any) => {
                console.error('[PROFILE] Banner upload error:', err);
                alert(`Banner upload error: ${err.message}`);
                setIsUploadingBanner(false);
              }}
              onUploadBegin={() => {
                console.log('[PROFILE] Banner upload starting');
                setIsUploadingBanner(true);
              }}
              appearance={{
                button: 'bg-gray-100 text-black rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-200 transition flex items-center gap-2',
                allowedContent: 'hidden',
              }}
              content={{
                button: isUploadingBanner ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>Edit Image</>
                ),
              }}
            />
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="px-8 pb-6 relative -mt-[60px] z-10">
        {/* Avatar */}
        <div className="relative w-[120px] h-[120px] rounded-full bg-white border-4 border-white mb-4 overflow-hidden">
          {profileData.avatarUrl ? (
            <Image
              src={profileData.avatarUrl}
              alt={profileData.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl text-gray-400">👤</span>
            </div>
          )}
          
          {/* Avatar Upload Button */}
          {profileData.isOwner && (
            <div className="absolute -bottom-2 -right-2 z-20">
              <UploadButton
                endpoint="avatar"
                onClientUploadComplete={(res: any) => {
                  console.log('[PROFILE] Avatar upload complete:', res);
                  if (res && res[0]?.url) {
                    handleAvatarUpload(res[0].url);
                  }
                  setIsUploadingAvatar(false);
                }}
                onUploadError={(err: any) => {
                  console.error('[PROFILE] Avatar upload error:', err);
                  alert(`Avatar upload error: ${err.message}`);
                  setIsUploadingAvatar(false);
                }}
                onUploadBegin={() => {
                  console.log('[PROFILE] Avatar upload starting');
                  setIsUploadingAvatar(true);
                }}
                appearance={{
                  button: 'bg-gray-100 text-black rounded-full p-2 shadow hover:bg-gray-200 transition text-xs font-semibold flex items-center justify-center w-8 h-8',
                  allowedContent: 'hidden',
                }}
                content={{
                  button: isUploadingAvatar ? (
                    <div className="animate-spin w-3 h-3 border-2 border-black border-t-transparent rounded-full"></div>
                  ) : (
                    <>Edit</>
                  ),
                }}
              />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">{profileData.name}</h1>
            <p className="text-base text-gray-600 mb-3">@{profileData.username}</p>
            {profileData.bio && profileData.bio !== 'My Cliq' && (
              <p className="text-gray-700 text-[15px] max-w-[400px] leading-relaxed">
                {profileData.bio}
              </p>
            )}
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <span>Birthday: {
                profileData.birthdate && profileData.birthdate !== 'Invalid Date' ? 
                  (() => {
                    try {
                      const date = new Date(profileData.birthdate + 'T00:00:00');
                      if (isNaN(date.getTime())) return 'Not set';
                      return date.toLocaleDateString('en-US', 
                        profileData.showYear 
                          ? { year: 'numeric', month: 'long', day: 'numeric' }
                          : { month: 'long', day: 'numeric' }
                      );
                    } catch {
                      return 'Not set';
                    }
                  })() : 'Not set'
              }</span>
            </div>
          </div>
          
          {/* Edit Profile Button */}
          {profileData.isOwner && (
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 px-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'about'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('wall')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'wall'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {sectionLabel}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="px-8 py-6">
        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-black mb-4">About</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">About Me</h3>
                <p className="text-gray-700">
                  {profileData.bio || 'No bio added yet.'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Birthday</h3>
                <p className="text-gray-700">
                  {new Date(profileData.birthdate + 'T00:00:00').toLocaleDateString('en-US', 
                    profileData.showYear 
                      ? { year: 'numeric', month: 'long', day: 'numeric' }
                      : { month: 'long', day: 'numeric' }
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wall' && (
          <div>
            {/* ScrapbookGallery Integration */}
            <ScrapbookGallery
              items={scrapbookItems}
              userId={profileData.id}
              isOwner={profileData.isOwner}
              sectionLabel={sectionLabel}
              layoutStyle={'masonry'}
              onItemAdded={onRefresh}
            />
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const bioValue = formData.get('bio') as string;
              const birthdateValue = formData.get('birthdate') as string;
              const showYearValue = formData.get('showYear') === 'on';
              
              handleProfileUpdate({
                about: bioValue,
                birthdate: birthdateValue,
                showYear: showYearValue,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">About Me</label>
                  <textarea
                    name="bio"
                    defaultValue={profileData.bio}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-black"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Birthday (Social Display)</label>
                  <input
                    type="date"
                    name="birthdate"
                    defaultValue={profileData.birthdate}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is for social display only. Your account birthdate for age verification cannot be changed.</p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showYear"
                    id="showYear"
                    defaultChecked={profileData.showYear}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="showYear" className="ml-2 text-sm text-gray-700">
                    Show my birth year on my profile
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
