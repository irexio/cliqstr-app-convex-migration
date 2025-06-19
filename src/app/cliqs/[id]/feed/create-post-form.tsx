import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreatePostForm({ cliqId }: { cliqId: string }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const res = await fetch(`/cliqs/${cliqId}/feed/create`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      router.refresh();
    } else {
      console.error('Failed to create post');
    }
  }

  return (
    <form action={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm space-y-4 border">
      <input type="hidden" name="cliqId" value={cliqId} />

      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full text-sm border rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
      />

      <input
        type="text"
        name="imageUrl"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Optional image URL"
        className="w-full text-sm border rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700"
        >
          Post
        </button>
      </div>
    </form>
  );
}
