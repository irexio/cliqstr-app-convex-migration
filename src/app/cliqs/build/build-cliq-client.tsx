'use client';

export const dynamic = 'force-dynamic';

/**
 * 🛠️ Cliq Builder Page — /cliqs/build
 *
 * Purpose:
 *   - Allows users to create a new cliq (name, description, privacy, and banner)
 *   - Uses UploadThing for image upload
 *   - POSTs to /api/cliqs/create
 *
 * Notes:
 *   - Not in a dynamic route, so no ghost fix needed
 *   - APA safety is enforced in the backend route
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { UploadDropzone } from '@/lib/uploadthing-client';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { fetchJson } from '@/lib/fetchJson';
import Image from 'next/image';

export default function BuildCliqClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'private' | 'semi' | 'public'>('private');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stripTags = (input: string) =>
    input.replace(/<[^>]*>?/gm, '').trim(); // 🧽 Strip HTML + trim

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanedName = stripTags(name);
    const cleanedDescription = stripTags(description);

    try {
      const data = await fetchJson('/api/cliqs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanedName,
          description: cleanedDescription,
          privacy,
          coverImage: bannerImage,
        }),
      });

      // Redirect to My Cliqs dashboard to see the new cliq
      router.push('/my-cliqs-dashboard');
      router.refresh(); // Force refresh to show new cliq
    } catch (err: any) {
      setError(err.message || 'Failed to create cliq.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create a New Cliq</h1>
      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <Label>Cliq Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
          />
        </div>

        <div>
          <Label>Privacy</Label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as 'private' | 'semi' | 'public')}
            className="w-full p-2 border rounded-md"
          >
            <option value="private">Private</option>
            <option value="semi">Semi-Private</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div>
          <Label>Banner Image</Label>
          <p className="text-xs text-neutral-500 italic mb-2">
            Recommended size: 1200×400px (landscape). Max file size: 4MB.
          </p>
          <UploadDropzone
            endpoint="cliqBanner"
            appearance={{
              container: 'border-dashed border-2 border-neutral-300 p-4 rounded-lg bg-neutral-50',
              button: 'bg-black text-white rounded-full px-4 py-2 text-sm hover:text-[#c032d1] transition',
              label: 'text-sm text-neutral-700',
            }}
            onClientUploadComplete={(res: any) => {
              if (res && res[0]?.url) {
                setBannerImage(res[0].url);
              }
            }}
            onUploadError={(err: any) => {
              console.error('Upload error:', err);
              setError('Image upload failed. Try again.');
            }}
          />
        </div>

        {bannerImage && (
          <div className="w-full max-w-md mt-4">
            <Image
              src={bannerImage}
              alt="Preview"
              width={600}
              height={200}
              className="rounded border object-cover"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Cliq'}
        </Button>
      </form>
    </div>
  );
}
