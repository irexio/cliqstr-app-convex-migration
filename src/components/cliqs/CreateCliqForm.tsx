'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/fetchJson';
import { UploadDropzone } from '@/lib/uploadthing-client';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

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

      router.push('/my-cliqs-dashboard');
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
      {/* ...rest of the form */}
    </form>
  );
}

