'use client';

import Image from 'next/image';

interface Reply {
  id: string;
  content: string;
  createdAt: Date;
  author: {
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
  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <div key={post.id} className="border p-4 rounded-md">
          <div className="flex items-start gap-4">
            <Image
              src="/default-avatar.png"
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold">
                {post.author.profile?.username || 'Unknown User'}
              </p>
              <p className="text-gray-700">{post.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {Array.isArray(post.replies) && post.replies.length > 0 && (
            <div className="mt-4 space-y-3 border-t pt-4">
              {post.replies.map((reply: Reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <Image
                    src="/default-avatar.png"
                    alt="Reply Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm">
                      {reply.author.profile?.username || 'Unknown User'}
                    </p>
                    <p className="text-gray-600 text-sm">{reply.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(reply.createdAt).toLocaleString()}
                    </p>
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
