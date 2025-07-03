'use client';

import BaseCard from './BaseCard';

interface PostCardProps {
  content: string;
  author?: string;
  timestamp?: string;
  imageUrl?: string;
}

export default function PostCard({ content, author, timestamp, imageUrl }: PostCardProps) {
  return (
    <BaseCard>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post image"
          className="w-full h-48 object-cover rounded-xl mb-3"
        />
      )}
      <p className="text-base mb-2">{content}</p>
      <div className="text-xs text-gray-500 mt-auto">
        {author && <span>By {author} </span>}
        {timestamp && <span>• {timestamp}</span>}
      </div>
    </BaseCard>
  );
}
