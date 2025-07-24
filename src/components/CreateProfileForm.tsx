'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@/lib/uploadthing-client';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { fetchJson } from '@/lib/fetchJson';

export default function CreateProfileForm() {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [about, setAbout] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !username || !birthdate) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
      setError('Username must be 3-15 characters, letters, numbers, or underscores only.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await fetchJson('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          firstName,
          lastName,
          birthdate,
          about,
          image: avatarUrl,
          bannerImage: bannerUrl,
        }),
      });

      router.push('/my-cliqs-dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('[PROFILE_CREATE_ERROR]', err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
        <p className="text-gray-600">
          Set up your social profile that will be visible to your cliq members
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name (or Nickname)
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          This is how you'll appear to your cliq members
        </p>

        {/* Birthdate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birthday
          </label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your age group determines privacy settings
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Choose Your Username
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              maxLength={15}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            3-15 characters, letters, numbers, and underscores only
          </p>
        </div>

        {/* About/Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            About You (Optional)
          </label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell your cliq members a bit about yourself..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            maxLength={280}
          />
          <p className="text-xs text-gray-500 mt-1">
            {about.length}/280 characters
          </p>
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture (Optional)
          </label>
          <div className="flex items-start gap-4">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            )}
            <div className="flex-1">
              <UploadDropzone
                endpoint="avatar"
                onClientUploadComplete={(res: any) => {
                  if (res?.[0]?.url) setAvatarUrl(res[0].url);
                }}
                onUploadError={(err: Error) => {
                  console.error('Avatar upload error:', err);
                  setError('Failed to upload avatar');
                }}
                appearance={{
                  container: 'border-dashed border-2 border-gray-300 rounded-lg p-4',
                  button: 'bg-black text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800',
                }}
              />
            </div>
          </div>
        </div>

        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Photo (Optional)
          </label>
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner preview"
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
          )}
          <UploadDropzone
            endpoint="banner"
            onClientUploadComplete={(res: any) => {
              if (res?.[0]?.url) setBannerUrl(res[0].url);
            }}
            onUploadError={(err: Error) => {
              console.error('Banner upload error:', err);
              setError('Failed to upload banner');
            }}
            appearance={{
              container: 'border-dashed border-2 border-gray-300 rounded-lg p-4',
              button: 'bg-black text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800',
            }}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}