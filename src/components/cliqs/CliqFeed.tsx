'use client';

// 🔐 APA-HARDENED — CliqFeed Client Component - 062625

import React, { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';

interface Profile {
  username?: string;
  image?: string; // avatar image URL for feed bubbles
}

interface User {
  profile?: Profile;
}

interface Reply {
  id: string;
  content: string;
  author: User;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  createdAt: string;
  expiresAt?: string;
  author: User;
  replies: Reply[];
}

interface FeedProps {
  cliqId: string;
}

export default function CliqFeed({ cliqId }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchJson(`/api/cliqs/feed?id=${cliqId}`);
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [cliqId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await fetchJson(`/api/cliqs/${cliqId}/posts`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setContent('');
      fetchFeed();
    } catch (err: any) {
      setError(err.message || 'Failed to post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-4">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share something with your cliq..."
          className="flex-1 border rounded px-3 py-2"
          disabled={submitting}
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded" disabled={submitting || !content.trim()}>
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
      {loading && <div>Loading feed...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="space-y-4">
        {posts.map(post => (
          <li key={post.id} className="border rounded p-4 bg-white">
            <div className="flex gap-3 items-start">
              {post.author?.profile?.image && post.author?.profile?.username ? (
                <a href={`/profile/${post.author.profile.username}`}>
                  <img
                    src={post.author.profile.image}
                    alt={post.author.profile.username}
                    className="w-10 h-10 rounded-full border object-cover hover:ring-2 hover:ring-primary transition"
                  />
                </a>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 border flex items-center justify-center text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="8" r="4" fill="#ccc"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4" fill="#ccc"/></svg>
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">{post.author?.profile?.username || 'Unknown'}</div>
                <div className="rounded-2xl border border-black bg-white px-4 py-2 shadow-sm text-base">
                  {post.content}
                </div>
                <div className="text-xs text-gray-400 mt-1">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {!loading && posts.length === 0 && <div className="text-gray-500">No posts yet.</div>}
    </div>
  );
}


