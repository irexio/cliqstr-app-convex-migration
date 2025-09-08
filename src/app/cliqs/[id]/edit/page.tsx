/**
 * 🔐 APA-HARDENED — Edit Cliq Page
 * 🔄 CONVEX-OPTIMIZED: Now uses Convex for real-time updates
 * 
 * PURPOSE: Allows cliq owners to edit their cliq's basic settings and information
 * 
 * WHAT USERS CAN EDIT:
 * - Cliq name (required, max 50 chars)
 * - Description (optional, max 200 chars) 
 * - Privacy level (private/semi-private/public)
 * - Cover image (optional banner/header image)
 * 
 * ACCESS: Only cliq owners can access this page
 * SECURITY: Owner verification, authentication required
 * 
 * USER FLOW:
 * 1. User clicks "Edit Cliq Settings" from cliq management menu
 * 2. Form loads with current cliq data pre-filled
 * 3. User makes changes and clicks "Update Cliq"
 * 4. Redirected back to cliq page with updated information
 */
export const dynamic = 'force-dynamic';

'use client';

import { useAuth } from '@/lib/auth/useAuth';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { notFound, redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditCliqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [cliqId, setCliqId] = useState<string>('');
  
  // Get cliq data using Convex
  const cliq = useQuery(api.cliqs.getCliq, 
    user?.id && cliqId ? { 
      cliqId: cliqId as Id<"cliqs">, 
      userId: user.id as Id<"users"> 
    } : "skip"
  );

  const updateCliq = useMutation(api.cliqs.updateCliq);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'private' | 'semi_private' | 'public'>('private');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set cliqId from params
  useEffect(() => {
    params.then(p => setCliqId(p.id));
  }, [params]);

  // Prefill form when cliq data loads
  useEffect(() => {
    if (cliq) {
      setName(cliq.name);
      setDescription(cliq.description || '');
      setPrivacy(cliq.privacy);
      setCoverImage(cliq.coverImage || '');
    }
  }, [cliq]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    redirect('/sign-in');
  }

  if (cliq === null) {
    notFound();
  }

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
  if (cliq.ownerId !== user.id) {
    redirect(`/cliqs/${cliqId}`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateCliq({
        cliqId: cliqId as Id<"cliqs">,
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliq Name *
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's this cliq about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Level
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL
            </label>
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