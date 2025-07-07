'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/fetchJson';
import { UploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/lib/uploadthing'; // Adjust path if needed

export default function CreateCliqForm({ userId }: { userId: string }) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await fetchJson('/api/cliqs/create', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          name,
          description,
          coverImage,
          privacy: 'private', // Can update later with dropdown
        }),
      });

      router.push('/my-cliqs');
    } catch (err: any) {
      console.error('[CREATE_CLIQ_ERROR]', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg border shadow"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Cliq Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full border px-3 py-2 rounded text-sm"
          placeholder="My Birthday Squad"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full border px-3 py-2 rounded text-sm"
          placeholder="This is a private cliq for my closest friends"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cliq Cover Image</label>
        <UploadDropzone<OurFileRouter, "cliqCover">
          endpoint="cliqCover"
          onClientUploadComplete={(res) => {
            if (res?.[0]?.url) {
              setCoverImage(res[0].url);
            }
          }}
          onUploadError={(err) => {
            console.error('[UPLOAD_ERROR]', err);
            setError('Image upload failed. Please try again.');
          }}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded hover:text-[#c032d1] text-sm transition"
      >
        {loading ? 'Creating...' : 'Create Cliq'}
      </button>
    </form>
  );
}
