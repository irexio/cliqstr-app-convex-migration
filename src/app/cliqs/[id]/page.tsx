'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchJson } from '@/lib/fetchJson';
import PostCardBubble from '@/components/PostCardBubble';
import PostForm from '@/components/PostForm';
import CliqTools from '@/components/CliqTools';

export default function CliqFeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cliqId = searchParams.get('id');

  const [cliq, setCliq] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cliqId) return;

    const loadCliq = async () => {
      try {
        const { cliq } = await fetchJson(`/api/cliqs?id=${cliqId}`);
        setCliq(cliq);
      } catch (err) {
        setError('Unable to load cliq.');
      }
    };

    const loadPosts = async () => {
      try {
        const { posts } = await fetchJson(`/api/cliqs/feed?id=${cliqId}`);
        setPosts(posts);
      } catch (err) {
        console.error(err);
      }
    };

    loadCliq();
    loadPosts();
  }, [cliqId]);

  if (!cliqId) return <p className="p-4">Missing cliq ID.</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {cliq && (
        <div className="space-y-2">
          <img src={cliq.coverImage} alt="Banner" className="w-full h-48 object-cover rounded-xl" />
          <h1 className="text-3xl font-bold font-poppins text-gray-900">{cliq.name}</h1>
          <p className="text-gray-600 text-sm">{cliq.description}</p>
          <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
            {cliq.privacy === 'private' ? 'Private Cliq' : 'Public'}
          </span>
        </div>
      )}

      <PostForm cliqId={cliqId} onPostCreated={setPosts} />

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCardBubble key={post.id} post={post} />
        ))}
      </div>

      <CliqTools cliqId={cliqId} />
    </main>
  );
}
