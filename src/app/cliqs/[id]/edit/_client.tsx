'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditCliqClient({ cliqId, currentUserId }: { cliqId: string; currentUserId: string; }) {
  const router = useRouter();

  // Get cliq data using Convex
  const cliq = useQuery(api.cliqs.getCliq,
    cliqId ? {
      cliqId: cliqId as Id<'cliqs'>,
      userId: currentUserId as Id<'users'>
    } : 'skip'
  );

  const updateCliq = useMutation(api.cliqs.updateCliq);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'private' | 'semi_private' | 'public'>('private');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill form when cliq data loads
  useEffect(() => {
    if (cliq) {
      setName(cliq.name);
      setDescription(cliq.description || '');
      setPrivacy(cliq.privacy);
      setCoverImage(cliq.coverImage || '');
    }
  }, [cliq]);

  if (cliq === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading cliq...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only the owner can edit
  if (cliq === null || cliq.ownerId !== currentUserId) {
    if (cliqId) router.push(`/cliqs/${cliqId}`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateCliq({
        cliqId: cliqId as Id<'cliqs'>,
        name: name.trim(),
        description: description.trim() || undefined,
        privacy,
        coverImage: coverImage || undefined,
      });

      router.push(`/cliqs/${cliqId}`);
    } catch (err: any) {
      console.error('[UPDATE_CLIQ_ERROR]', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Edit Cliq</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliq Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Birthday Squad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's this cliq about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Level</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as 'private' | 'semi_private' | 'public')}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="private">Private - Only invited members</option>
              <option value="semi_private">Semi-Private - Members can invite others</option>
              <option value="public">Public - Anyone can join</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/cliqs/${cliqId}`)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


