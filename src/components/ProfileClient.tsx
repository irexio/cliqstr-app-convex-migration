'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProfileClient({
  profile,
}: {
  profile: {
    name: string;
    username: string;
    birthday: string;
    bio: string;
    avatarUrl?: string;
    bannerUrl?: string;
  };
}) {
  const [data, setData] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  const handleSave = () => {
    console.log('[TODO] Save to DB:', data);
    setIsEditing(false);
  };

  return (
    <main className="max-w-4xl mx-auto">
      {/* Banner */}
      <div className="relative h-48 sm:h-60 md:h-72 lg:h-80 w-full">
        <Image
          src={data.bannerUrl || '/default-banner.jpg'}
          alt="Profile banner"
          fill
          className="object-cover rounded-b-lg"
          priority
        />
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
        >
          ✎
        </button>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center px-4 py-8 bg-white rounded-b-xl shadow-md">
        <div className="-mt-20 w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md">
          <Image
            src={data.avatarUrl || '/default-avatar.png'}
            alt="Profile picture"
            width={128}
            height={128}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="text-center mt-4">
          <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">{data.name}</h1>
          <p className="text-sm text-gray-600">@{data.username}</p>
          <p className="text-sm text-gray-500 mt-1">Birthday: {data.birthday}</p>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-sm font-semibold text-gray-700">About</h2>
          <p className="text-gray-600 text-sm mt-1 max-w-md">{data.bio}</p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
        >
          Edit Profile
        </button>
      </div>

      {/* Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
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
              <label className="block text-sm">Birthday</label>
              <input
                type="text"
                value={data.birthday}
                onChange={(e) => handleChange('birthday', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Bio</label>
              <textarea
                value={data.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Avatar URL</label>
              <input
                type="text"
                value={data.avatarUrl}
                onChange={(e) => handleChange('avatarUrl', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Banner URL</label>
              <input
                type="text"
                value={data.bannerUrl}
                onChange={(e) => handleChange('bannerUrl', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
