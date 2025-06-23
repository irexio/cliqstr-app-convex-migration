'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Reply {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name?: string;
    image?: string | null;
    profile: {
      username: string;
    } | null;
  };
}

interface Post {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name?: string;
    image?: string | null;
    profile: {
      username: string;
    } | null;
  };
  replies?: Reply[];
}

interface CliqFeedProps {
  posts: Post[];
}

export default function CliqFeed({ posts }: CliqFeedProps) {
  if (!posts.length) {
    return <p className="text-center text-gray-500 py-8">No posts yet. Be the first to share something!</p>;
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start gap-4">
            <Image
              src={post.author.image || '/default-avatar.png'}
              alt={post.author.name || 'Avatar'}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800">
                  {post.author.name || post.author.profile?.username || 'Unknown User'}
                </p>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-gray-700 mt-1">{post.content}</p>
            </div>
          </div>

          {Array.isArray(post.replies) && post.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-8 border-l-2 border-neutral-200">
              {post.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <Image
                    src={reply.author.image || '/default-avatar.png'}
                    alt={reply.author.name || 'Reply Avatar'}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-800">
                        {reply.author.name || reply.author.profile?.username || 'Unknown User'}
                      </p>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
