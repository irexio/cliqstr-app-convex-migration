'use client';

export const dynamic = 'force-dynamic';

// 🔐 APA-HARDENED — Edit your profile (private, not public-facing)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@/lib/uploadthing-client';
import { fetchJson } from '@/lib/fetchJson';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load current profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchJson('/api/profile/me');
        if (res?.profile) {
          setProfile(res.profile);
          setUsername(res.profile.username || '');
          setAbout(res.profile.about || '');
          setAvatarUrl(res.profile.image || '');
          setBannerUrl(res.profile.bannerImage || '');
        }
      } catch (err: any) {
        console.error('❌ Profile load error:', err);
        setError(err.message || 'Failed to load profile.');
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await fetchJson('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          about,
          image: avatarUrl,
          bannerImage: bannerUrl,
        }),
      });

      router.push(`/profile/${username}`);
    } catch (err: any) {
      console.error('❌ Profile update failed:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        {error ? error : 'Loading profile...'}
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded text-sm"
          />
        </div>

        {/* About */}
        <div>
          <label className="block text-sm font-medium text-gray-700">About You</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="mt-1 w-full border px-3 py-2 rounded text-sm"
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Update Avatar</label>
          <UploadDropzone
            endpoint="avatar"
            onClientUploadComplete={(res: any) => {
              if (res?.[0]?.url) setAvatarUrl(res[0].url);
            }}
            onUploadError={(err: Error) => alert(`Avatar upload error: ${err.message}`)}
          />
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Avatar Preview"
              className="mt-2 w-20 h-20 rounded-full border object-cover"
            />
          )}
        </div>

        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Update Banner</label>
          <UploadDropzone
            endpoint="banner"
            onClientUploadComplete={(res: any) => {
              if (res?.[0]?.url) setBannerUrl(res[0].url);
            }}
            onUploadError={(err: Error) => alert(`Banner upload error: ${err.message}`)}
          />
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner Preview"
              className="mt-2 w-full h-32 object-cover rounded border"
            />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 text-sm"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </main>
  );
}
