'use client';

// 🔐 APA-COMPATIBLE — PostForm (using Convex)

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth/useAuth';

interface PostFormProps {
  cliqId: string;
  onPostCreated?: (newPost: any) => void;
}

export default function PostForm({ cliqId, onPostCreated }: PostFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const createPost = useMutation(api.posts.createPost);

  // Check if user has a profile - required for posting
  if (!user?.myProfile) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Create a profile to start posting</h3>
            <p className="text-sm text-blue-700 mt-1">
              You need to create a profile before you can post in cliqs. 
              <a href="/profile/create" className="underline ml-1">Create your profile now</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user?.id) return;

    setLoading(true);
    setError('');

    try {
      const postId = await createPost({
        content: content.trim(),
        authorId: user.id as Id<"users">,
        cliqId: cliqId as Id<"cliqs">,
      });

      if (onPostCreated) {
        onPostCreated({
          id: postId,
          content,
          cliqId,
          createdAt: Date.now(),
          author: {
            id: user.id,
            profile: {
              username: user.myProfile?.username || 'You',
            },
          },
        });
      }

      setContent('');
    } catch (err: any) {
      console.error('⚠️ Post error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post... 🐧💬✨"
        rows={4}
        disabled={loading}
        className="resize-none"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="text-right">
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
}
