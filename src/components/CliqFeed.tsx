'use client';

// 🔐 APA-HARDENED — CliqFeed Client Component - 062625
// Accepts `cliqId` (required) and optional `initialPosts` for server-side hydration
// Falls back to dynamic fetch if `initialPosts` not provided
// Submits new posts directly to app/cliqs/[id]/feed using dynamic POST

import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';

interface Profile {
  username?: string;
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

  useEffect(() => {
    const fetchFeed = async () => {
      try {
       const data = await fetchJson(`/api/cliqs/feed?id=${cliqId}`);
        setPosts(data.posts || []);
      } catch (err: any) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [cliqId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await fetchJson('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, cliqId }),
      });

      setContent('');
      location.reload();
    } catch (err) {
      console.error('❌ Post failed:', err);
      setError('Something went wrong while posting.');
    }
  };

  return (
    <div className="relative p-4 max-w-xl mx-auto">
      {/* Pip Button */}
      <div className="absolute top-4 right-4 z-40">
        <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition" aria-label="Talk to Pip or Pippy">
          🐧
        </button>
      </div>

      {/* Red Alert Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 transition" aria-label="Red Alert">
          🚨 Red Alert
        </button>
      </div>

      {/* Feed Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Mimi’s Cliq ✨</h2>
        <p className="text-gray-600 text-sm">A safe space for awesome friends!</p>
      </div>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-2 shadow-sm mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What’s on your mind? Share something cool! ✨"
          className="w-full resize-none border-none outline-none text-gray-700 placeholder-gray-400"
        />

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <span>😊</span>
            <span>💖</span>
            <span>🎉</span>
            <span>📸</span>
          </div>
          <button
            type="submit"
            className="bg-black text-white rounded-full px-4 py-1 text-sm hover:text-[#c032d1] transition"
          >
            Share ✨
          </button>
        </div>
      </form>

      {/* Posts */}
      {loading ? (
        <p className="text-center text-gray-500">Loading feed...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const daysLeft = post.expiresAt
              ? Math.ceil((new Date(post.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div key={post.id} className="bg-white border rounded-xl p-4 space-y-2">
                <div className="text-sm font-semibold">{post.author.profile?.username || 'Anonymous'}</div>
                <p className="text-gray-800">{post.content}</p>

                {daysLeft !== null && (
                  <p className="text-xs text-[#c032d1] italic">
                    Expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}
                  </p>
                )}

                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>💖 3</span>
                  <span>💬 Reply</span>
                  <span>🎉 Celebrate</span>
                </div>

                {/* Replies */}
                {post.replies?.length > 0 && (
                  <div className="pl-4 mt-2 space-y-1 border-l border-gray-200">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="text-sm text-gray-700">
                        <strong>{reply.author.profile?.username || 'Reply'}:</strong> {reply.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}