'use client';

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
        <p className="text-sm text-center text-neutral-400">No posts yet.</p>
      )}

      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-700 mb-2">
            <strong>{post.author?.profile?.username || 'Anonymous'}:</strong> {post.content}
          </p>

          {post.replies?.length > 0 && (
            <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
              {post.replies.map((reply) => (
                <p key={reply.id} className="text-sm text-gray-600">
                  <strong>{reply.author?.profile?.username || 'Anon'}:</strong> {reply.content}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
