'use client';

// 🔐 APA-HARDENED — CliqFeed Client Component - 062625

import React, { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';
import PostCardBubble from '@/components/PostCardBubble';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  about?: string | null;
  image?: string | null;
  bannerImage?: string | null;
}

interface User {
  id?: string;
  myProfile?: Profile;
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
    id?: string;
    myProfile: {
      username: string;
      image?: string;
    } | null;
  };
}

interface FeedProps {
  cliqId: string;
  currentUserProfile?: Profile | null;
}

export default function CliqFeed({ cliqId, currentUserProfile }: FeedProps) {
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
      await fetchJson('/api/posts/create', {
        method: 'POST',
        body: JSON.stringify({ 
          content: content.trim(),
          cliqId 
        }),
      });
      setContent('');
      fetchFeed();
    } catch (err: any) {
      setError(err.message || 'We couldn\'t share your post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feed Controls & Composer */}
      <section className="bg-white rounded-xl p-5 mb-6 shadow-sm">
        {/* View toggle */}
        <div className="flex gap-3 mb-5">
          <button className="px-4 py-2 border border-gray-200 bg-black text-white rounded-full cursor-pointer text-sm transition-all">
            Inline View
          </button>
          <button className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-full cursor-pointer text-sm transition-all hover:border-gray-400">
            Gallery View
          </button>
        </div>
        
        {/* Post composer */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3 items-start">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="8" r="4" fill="#999"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4" fill="#999"/></svg>
              </AvatarFallback>
            </Avatar>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to share with your cliq?"
              className="flex-1 border border-gray-200 rounded-3xl px-5 py-3 text-base resize-none min-h-[44px] outline-none transition-colors focus:border-black"
              disabled={submitting}
            />
          </div>
          <div className="flex gap-2 ml-[52px]">
            <button type="button" className="px-3 py-1.5 border border-gray-200 bg-white rounded-2xl cursor-pointer text-xs text-gray-600">
              📷 Photo
            </button>
            <button type="button" className="px-3 py-1.5 border border-gray-200 bg-white rounded-2xl cursor-pointer text-xs text-gray-600">
              📹 Video
            </button>
            <button type="button" className="px-3 py-1.5 border border-gray-200 bg-white rounded-2xl cursor-pointer text-xs text-gray-600">
              📊 Poll
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-3 py-1.5 bg-black text-white border-black rounded-2xl cursor-pointer text-xs font-medium ml-auto disabled:opacity-50"
            >
              {submitting ? '...' : 'Share'}
            </button>
          </div>
        </form>
      </section>
      

      
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
              id: post.author?.id,
              myProfile: post.author?.myProfile ? {
                username: post.author.myProfile.username || 'Unknown',
                image: post.author.myProfile.image || undefined
              } : null
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
                        id: reply.author?.id,
                        myProfile: reply.author?.myProfile ? {
                          username: reply.author.myProfile.username || 'Unknown',
                          image: reply.author.myProfile.image || undefined
                        } : null
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


