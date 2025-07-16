'use client';

// 🔐 APA-HARDENED — CliqFeed Client Component - 062625

import React, { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';
import PostCardBubble from '@/components/PostCardBubble';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  username?: string;
  image?: string; // avatar image URL for feed bubbles
}

interface User {
  profile?: Profile;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  createdAt: string;
  expiresAt?: string;
  author: User;
  replies: Reply[];
}

// Interface matching PostCardBubble requirements
interface FormattedPost {
  id: string;
  content?: string;
  image?: string;
  createdAt: string;
  author: {
    profile: {
      username: string;
      image?: string;
    };
  };
}

interface FeedProps {
  cliqId: string;
}

export default function CliqFeed({ cliqId }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchJson(`/api/cliqs/feed?id=${cliqId}`);
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [cliqId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await fetchJson(`/api/cliqs/${cliqId}/posts`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setContent('');
      fetchFeed();
    } catch (err: any) {
      setError(err.message || 'Failed to post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">Cliq Feed</h2>
      
      {/* Post creation form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-6 bg-white rounded-lg p-3 shadow-sm border">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt="Profile" />
          <AvatarFallback className="bg-gray-200 text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="8" r="4" fill="#ccc"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4" fill="#ccc"/></svg>
          </AvatarFallback>
        </Avatar>
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share something with your cliq..."
          className="flex-1 border-b border-gray-200 px-3 py-2 focus:outline-none focus:border-gray-400"
          disabled={submitting}
        />
        <button 
          type="submit" 
          className="bg-black text-white px-4 py-2 rounded-full text-sm" 
          disabled={submitting || !content.trim()}
        >
          {submitting ? '...' : 'Send'}
        </button>
      </form>
      
      {loading && <div className="text-center py-4">Loading feed...</div>}
      {error && <div className="text-red-600 text-center py-2">{error}</div>}
      
      {/* Messages feed using PostCardBubble component */}
      <div className="space-y-4">
        {posts.map(post => {
          // Ensure post has the required structure for PostCardBubble
          const formattedPost: FormattedPost = {
            id: post.id,
            content: post.content,
            image: post.image,
            createdAt: post.createdAt,
            author: {
              profile: {
                username: post.author?.profile?.username || 'Unknown',
                image: post.author?.profile?.image
              }
            }
          };
          
          return (
            <div key={post.id} className="mb-4">
              <PostCardBubble post={formattedPost} />
              
              {post.replies && post.replies.length > 0 && (
                <div className="ml-8 mt-2 space-y-2">
                  {post.replies.map(reply => {
                    // Format reply for PostCardBubble
                    const formattedReply: FormattedPost = {
                      id: reply.id,
                      content: reply.content,
                      createdAt: reply.createdAt,
                      author: {
                        profile: {
                          username: reply.author?.profile?.username || 'Unknown',
                          image: reply.author?.profile?.image
                        }
                      }
                    };
                    
                    return (
                      <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
                        <PostCardBubble post={formattedReply} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {!loading && posts.length === 0 && (
        <div className="text-gray-500 text-center py-8 border border-dashed rounded-lg">
          No messages yet. Start a conversation!
        </div>
      )}
    </div>
  );
}


