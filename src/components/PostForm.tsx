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
