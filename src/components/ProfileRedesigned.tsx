'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProfileSidebar } from './ProfileSidebar';
import ScrapbookGallery from './ScrapbookGallery';
import { UploadButton } from '@/lib/uploadthing-client';
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
    galleryLayoutStyle?: 'inline' | 'masonry';
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

export default function ProfileRedesigned({ profile, scrapbookItems, onRefresh }: ProfileProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  const [galleryLayout, setGalleryLayout] = useState<'grid' | 'freeform'>('grid');

  const { group } = getAgeGroup(profile.birthdate);
  const sectionLabel = group === 'child' ? 'Show & Tell' : 'My Wall';

  const handleProfileUpdate = async (updates: any) => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const result = await response.json();
      setProfileData({ ...profileData, ...updates });
      setIsEditingProfile(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="flex-1">
      {/* Cover Photo */}
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
      </div>

      {/* Profile Header */}
      <header className="bg-white px-8 pb-6 relative -mt-[60px] z-10">
        {/* Avatar */}
        <div className="w-[120px] h-[120px] rounded-full bg-white border-4 border-white mb-4 overflow-hidden relative">
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
        </div>

        {/* Profile Info */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">{profileData.name}</h1>
            <p className="text-base text-gray-600 mb-3">@{profileData.username}</p>
            {profileData.bio && (
              <p className="text-gray-700 text-[15px] max-w-[400px] leading-relaxed">
                {profileData.bio}
              </p>
            )}
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <span>Birthday: {new Date(profileData.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
              <span>Member of 5 cliqs</span>
            </div>
          </div>
          
          {/* Mobile Edit Button */}
          {profileData.isOwner && (
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="md:hidden bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="grid md:grid-cols-[250px_1fr] max-w-[1200px] mx-auto">
        {/* Desktop Sidebar */}
        <ProfileSidebar 
          isOwner={profileData.isOwner}
          onEditProfile={() => setIsEditingProfile(true)}
          onEditCover={() => setIsEditingCover(true)}
        />

        {/* Main Content */}
        <main className="px-8 py-8">
          {/* About Section */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-black">About Me</h2>
            <p className="text-[15px] text-gray-700 leading-relaxed">
              {profileData.bio || 'No bio yet.'}
            </p>
          </section>

          {/* Scrapbook/Wall Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black">{sectionLabel}</h2>
              <div className="flex gap-3 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setGalleryLayout('grid')}
                    className={`px-3 py-1.5 border rounded-2xl text-xs transition ${
                      galleryLayout === 'grid' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setGalleryLayout('freeform')}
                    className={`px-3 py-1.5 border rounded-2xl text-xs transition ${
                      galleryLayout === 'freeform' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    Freeform
                  </button>
                </div>
                {profileData.isOwner && (
                  <button className="bg-black text-white px-4 py-1.5 rounded-2xl text-xs font-medium hover:bg-gray-800 transition">
                    📷 Upload
                  </button>
                )}
              </div>
            </div>

            {/* Scrapbook Grid */}
            <div className={`grid gap-4 ${
              galleryLayout === 'grid' 
                ? 'grid-cols-5 md:grid-cols-5 sm:grid-cols-3 grid-cols-1' 
                : 'grid-cols-1'
            }`}>
              {/* Add Item Button */}
              {profileData.isOwner && (
                <button className="aspect-square border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:border-black hover:text-black hover:bg-white transition cursor-pointer text-2xl">
                  +
                </button>
              )}
              
              {/* Scrapbook Items */}
              {scrapbookItems.map(item => (
                <div 
                  key={item.id} 
                  className="aspect-square rounded-lg overflow-hidden relative cursor-pointer transition-transform hover:scale-105"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.caption || 'Scrapbook item'}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleProfileUpdate({
                about: formData.get('bio'),
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    name="bio"
                    defaultValue={profileData.bio}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-black"
                    placeholder="Tell us about yourself..."
                  />
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
  );
}