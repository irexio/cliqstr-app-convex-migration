'use client';

// 🔐 APA-HARDENED — Edit your profile (private, not public-facing)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from "@/app/api/uploadthing/core"; // ✅ Only import the type!

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/profile/me');
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setUsername(data.profile.username || '');
        setAbout(data.profile.about || '');
        setAvatarUrl(data.profile.image || '');
        setBannerUrl(data.profile.bannerImage || '');
      } else {
        setError(data.error || 'Failed to load profile.');
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          about,
          image: avatarUrl,
          bannerImage: bannerUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Update failed');
      }

      router.push(`/profile/${username}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-10">Loading profile...</div>;

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
          <UploadDropzone<OurFileRouter, any>
            endpoint="avatar"
            onClientUploadComplete={(res) => {
              if (res && res[0]?.url) setAvatarUrl(res[0].url);
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
          <UploadDropzone<OurFileRouter, any>
            endpoint="banner"
            onClientUploadComplete={(res) => {
              if (res && res[0]?.url) setBannerUrl(res[0].url);
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
