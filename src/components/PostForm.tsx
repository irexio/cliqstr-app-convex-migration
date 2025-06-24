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
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/cliqs/${cliqId}/feed/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      const result = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        console.error('❌ Post failed:', result);
        setError(typeof result === 'string' ? result : result?.error || 'Unknown error');
        return;
      }

      console.log('✅ Post created:', result);
      setContent('');
      router.refresh();
    } catch (err: any) {
      console.error('⚠️ Network error:', err);
      setError('Network error — please try again.');
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
