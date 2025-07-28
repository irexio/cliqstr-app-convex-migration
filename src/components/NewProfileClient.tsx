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
  const [activeTab, setActiveTab] = useState('wall');
  
  // Get the appropriate label for the scrapbook section based on age group
  const { group } = getAgeGroup(profile.birthdate);
  const sectionLabel = group === 'child' ? 'Show & Tell' : 'Scrapbook';
  
  // Set default layout style based on age group
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
      
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('[PROFILE] Update error:', error);
      alert('Failed to update profile: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-80 w-full">
        <Image
          src={data.bannerUrl || '/images/default-banner.jpg'}
          alt="Profile banner"
          fill
          className="object-cover"
          priority
        />
        
        {/* Banner Upload Button */}
        {data.isOwner && !uploadingBanner && (
          <button
            onClick={() => setUploadingBanner(true)}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200"
            aria-label="Change banner image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        )}
        
        {/* Edit Profile Button */}
        {data.isOwner && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-4 right-20 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
          >
            Edit Profile
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
                    const fileData = res[0] as any;
                    const fileUrl = fileData.url || fileData.fileUrl || fileData.appUrl;
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
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end space-x-6 -mt-20 pb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                <Image
                  src={data.avatarUrl || '/images/default-avatar.png'}
                  alt="Profile picture"
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Avatar Upload Button */}
              {data.isOwner && !uploadingAvatar && (
                <button
                  onClick={() => setUploadingAvatar(true)}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                  aria-label="Change profile picture"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 pb-4">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.name}</h1>
              <p className="text-xl text-gray-600 mb-3">@{data.username}</p>
              
              {/* Birthday */}
              <div className="flex items-center text-gray-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Birthday: {new Date(data.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
              </div>
              
              {/* About */}
              {data.bio && (
                <div className="max-w-2xl">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                  <p className="text-gray-600 leading-relaxed">{data.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
                    const fileData = res[0] as any;
                    const fileUrl = fileData.url || fileData.fileUrl || fileData.appUrl;
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



      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('wall')}
              className={`py-4 px-1 border-b-2 font-semibold text-base transition-colors ${
                activeTab === 'wall'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Wall
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 border-b-2 font-semibold text-base transition-colors ${
                activeTab === 'about'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              About Me
            </button>
            {data.canViewGallery && (
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-4 px-1 border-b-2 font-semibold text-base transition-colors ${
                  activeTab === 'gallery'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {sectionLabel}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeTab === 'wall' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Post Creation */}
              {data.isOwner && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={data.avatarUrl || '/images/default-avatar.png'}
                        alt="Your avatar"
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="What's on your mind?"
                      className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-6">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <span className="font-medium">Photo</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7"/>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        <span className="font-medium">Video</span>
                      </button>
                    </div>
                    <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                      Post
                    </button>
                  </div>
                </div>
              )}
              
              {/* Posts Feed */}
              <div className="text-center py-16 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-6 text-gray-300">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <p className="text-xl font-medium text-gray-400 mb-2">No posts yet</p>
                <p className="text-gray-400">Share your first moment on your wall!</p>
              </div>
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">About Me</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="text-lg text-gray-700">{data.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="m22 21-3-3m0 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"/>
                    </svg>
                    <span className="text-lg text-gray-700">@{data.username}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="text-lg text-gray-700">Born {new Date(data.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {data.bio && (
                    <div className="pt-6 border-t border-gray-100">
                      <p className="text-lg text-gray-700 leading-relaxed">{data.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'gallery' && data.canViewGallery && (
            <div>
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
        </div>
      </div>

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
    </div>
  );
}
