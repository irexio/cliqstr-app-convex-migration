'use client';

import React, { useState } from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface PostCardBubbleProps {
  post: {
    id: string;
    content?: string;
    image?: string;
    createdAt: string;
    author: {
      id?: string;
      myProfile: {
        username: string;
        image?: string;
      } | null;
    };
  };
}

const emojiOptions = ['👍', '❤️', '😂', '😮', '🎉'];

export default function PostCardBubble({ post }: PostCardBubbleProps) {
  const { content, image, createdAt, author } = post;
  const username = author.myProfile?.username || 'Unknown';
  const avatar = author.myProfile?.image;
  const hasProfile = author.myProfile !== null;
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  return (
    <div className="flex gap-3 items-start px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
      <UserAvatar 
        image={avatar}
        name={username}
        userId={author.id}
        username={username}
        hasProfile={hasProfile}
        size="md"
        className="border border-gray-300"
        clickable={true}
      />
      <div className="flex flex-col">
        <div className="text-sm font-semibold text-gray-900">{username}</div>
        {content && <p className="text-sm text-gray-800 whitespace-pre-line mt-1">{content}</p>}
        {image && (
          <img src={image} alt="post" className="mt-2 rounded-md max-h-60 object-contain border" />
        )}
        <div className="text-xs text-gray-500 mt-2">
          {new Date(createdAt).toLocaleString()}
        </div>

        <div className="mt-2 flex gap-2 text-xl">
          {emojiOptions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              className={`hover:scale-110 transition-transform ${selectedEmoji === emoji ? 'opacity-100' : 'opacity-40'}`}
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Note: For full emoji picker support (like Google Emoji Picker), you can later install
// a package such as `emoji-mart` and render a full emoji selector instead of static options.
