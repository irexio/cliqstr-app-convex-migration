'use client';

import Image from 'next/image';

interface Profile {
  username?: string;
  image?: string | null;
}

interface User {
  profile?: Profile | null;
}

interface Reply {
  id: string;
  content: string;
  author: User;
}

interface Post {
  id: string;
  content: string;
  image?: string | null;
  author: User;
  replies: Reply[];
}

interface FeedProps {
  posts: Post[];
}

export default function CliqFeed({ posts }: FeedProps) {
  return (
    <div className="space-y-6 mt-4">
      {posts.length === 0 && (
        <p className="text-sm text-center text-neutral-400">No posts yet. Be the first to say hi!</p>
      )}

      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-start gap-3">
            <Image
              src={post.author?.profile?.image || '/default-avatar.png'}
              alt="avatar"
              width={40}
              height={40}
              className="rounded-full border w-10 h-10 object-cover"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-800">
                  {post.author?.profile?.username || 'Anonymous'}
                </span>
              </p>

              {/* Post content */}
              {post.content && (
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{post.content}</p>
              )}

              {/* Image display */}
              {post.image && (
                <div className="mt-3 rounded-md overflow-hidden border w-full max-w-md">
                  <Image
                    src={post.image}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="rounded-md object-cover"
                  />
                </div>
              )}

              {/* Replies */}
              {post.replies?.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-neutral-200 space-y-2">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2">
                      <Image
                        src={reply.author?.profile?.image || '/default-avatar.png'}
                        alt="avatar"
                        width={30}
                        height={30}
                        className="rounded-full border w-8 h-8 object-cover"
                      />
                      <div className="flex-1 text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">
                          {reply.author?.profile?.username || 'Anon'}:
                        </span>{' '}
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
