'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/Button';

interface PostFormProps {
  cliqId: string;
}

export default function PostForm({ cliqId }: PostFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, cliqId }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('❌ Post failed:', error);
        return;
      }

      const result = await res.json();
      console.log('✅ Post created:', result);

      setContent('');
      router.refresh();
    } catch (err) {
      console.error('⚠️ Network or parse error:', err);
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
      />
      <div className="text-right">
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
}
