'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/lib/uploadthing';

export default function SetupProfileClient({ userId }: { userId: string }) {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [invitedRole, setInvitedRole] = useState('');
  const [cliqId, setCliqId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = sessionStorage.getItem('inviteCode');
    const role = sessionStorage.getItem('invitedRole');
    const cliq = sessionStorage.getItem('cliqId');

    if (code && role && cliq) {
      setInviteCode(code);
      setInvitedRole(role);
      setCliqId(cliq);
    } else {
      router.push('/sign-up');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !birthdate) {
      setError('Please fill out all fields.');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
      setError('Username must be 3–15 characters, letters, numbers, or underscores only.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sign-up/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username,
          birthdate,
          inviteCode,
          cliqId,
          invitedRole,
          image: avatarUrl,
          bannerImage: bannerUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete sign-up.');
      }

      console.log('[✅] Signed up:', data);
      router.push('/my-cliqs');
    } catch (err: any) {
      console.error('[❌] Signup error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Finish Setting Up</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a fun name"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Birthdate</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Avatar</label>
          <p className="text-xs text-neutral-500 italic mb-2">Recommended: square image, 400×400px</p>
          <UploadDropzone<OurFileRouter, 'avatar'>
            endpoint="avatar"
            appearance={{
              button: 'bg-black text-white rounded-full px-4 py-2 text-sm hover:text-[#c032d1] transition',
              container: 'border-dashed border-2 border-neutral-300 p-4 rounded-lg bg-neutral-50',
            }}
            onClientUploadComplete={(res) => {
              if (res && res[0]?.url) setAvatarUrl(res[0].url);
            }}
            onUploadError={(err) => alert(`Avatar upload error: ${err.message}`)}
          />
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Avatar Preview"
              className="mt-2 w-20 h-20 object-cover rounded-full border"
            />
          )}
        </div>

        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Banner</label>
          <p className="text-xs text-neutral-500 italic mb-2">Recommended: wide landscape, 1200×400px</p>
          <UploadDropzone<OurFileRouter, 'banner'>
            endpoint="banner"
            appearance={{
              button: 'bg-black text-white rounded-full px-4 py-2 text-sm hover:text-[#c032d1] transition',
              container: 'border-dashed border-2 border-neutral-300 p-4 rounded-lg bg-neutral-50',
            }}
            onClientUploadComplete={(res) => {
              if (res && res[0]?.url) setBannerUrl(res[0].url);
            }}
            onUploadError={(err) => alert(`Banner upload error: ${err.message}`)}
          />
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner Preview"
              className="mt-2 w-full h-32 object-cover rounded border"
            />
          )}
        </div>

        {/* Invite Info */}
        {inviteCode && (
          <div className="text-sm text-gray-600">
            You’re joining a cliq as a <strong>{invitedRole}</strong> using an invite code.
          </div>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:text-[#c032d1] text-sm transition"
        >
          {loading ? 'Finishing...' : 'Create My Profile'}
        </button>
      </form>
    </main>
  );
}
