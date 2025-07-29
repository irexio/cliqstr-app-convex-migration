'use client';

import { useState, useEffect } from 'react';
import { fetchJson } from '@/lib/fetchJson';

interface CliqNotice {
  id: string;
  type: 'birthday' | 'admin' | 'red_alert_open' | 'red_alert_resolved';
  content: string;
  createdAt: string;
  expiresAt?: string | null;
}

interface CliqNoticeBarProps {
  cliqId: string;
}

/**
 * 🔔 CliqNoticeBar Component
 * 
 * Displays notice banners at the top of cliq pages:
 * - 🎉 Birthday notices (auto-generated)
 * - 🛠️ Admin notices (manual)
 * - 🔴 Red alert notices (safety system)
 * 
 * Features:
 * - Multiple stacked notices support
 * - Auto-refresh for real-time updates
 * - Dismissible notices (UX enhancement)
 * - APA-safe: only visible to cliq members
 */
export default function CliqNoticeBar({ cliqId }: CliqNoticeBarProps) {
  const [notices, setNotices] = useState<CliqNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedNotices, setDismissedNotices] = useState<Set<string>>(new Set());

  // Fetch active notices for this cliq
  const fetchNotices = async () => {
    try {
      const data = await fetchJson(`/api/cliqs/${cliqId}/notices`);
      setNotices(data.notices || []);
    } catch (error) {
      console.error('[CLIQ_NOTICES] Failed to fetch notices:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    
    // Auto-refresh notices every 30 seconds for real-time updates
    const interval = setInterval(fetchNotices, 30000);
    return () => clearInterval(interval);
  }, [cliqId]);

  // Get notice styling based on type
  const getNoticeStyle = (type: CliqNotice['type']) => {
    switch (type) {
      case 'birthday':
        return {
          bg: 'bg-gradient-to-r from-pink-50 to-purple-50',
          border: 'border-pink-200',
          text: 'text-pink-800',
          icon: '🎉'
        };
      case 'admin':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: '🗓️'
        };
      case 'red_alert_open':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-orange-50',
          border: 'border-red-300',
          text: 'text-red-800',
          icon: '⚠️'
        };
      case 'red_alert_resolved':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: '✅'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: '📢'
        };
    }
  };

  // Dismiss a notice (client-side only, doesn't delete from DB)
  const dismissNotice = (noticeId: string) => {
    setDismissedNotices(prev => new Set([...prev, noticeId]));
  };

  // Filter out dismissed notices
  const visibleNotices = notices.filter(notice => !dismissedNotices.has(notice.id));

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 h-12 rounded-lg mb-4"></div>
    );
  }

  if (visibleNotices.length === 0) {
    return null; // No notices to show
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleNotices.map((notice) => {
        const style = getNoticeStyle(notice.type);
        
        return (
          <div
            key={notice.id}
            className={`${style.bg} ${style.border} border rounded-lg p-4 shadow-sm relative`}
          >
            <div className="flex items-start gap-3">
              {/* Notice Icon */}
              <span className="text-xl flex-shrink-0 mt-0.5">
                {style.icon}
              </span>
              
              {/* Notice Content */}
              <div className="flex-1">
                <p className={`${style.text} text-sm leading-relaxed`}>
                  {notice.content}
                </p>
                
                {/* Timestamp for admin notices */}
                {notice.type === 'admin' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Posted {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {/* Dismiss Button */}
              <button
                onClick={() => dismissNotice(notice.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white/50"
                title="Dismiss notice"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 🎨 Notice Type Examples:
 * 
 * 🎉 Birthday: "This week is Sarah's birthday! Drop her some birthday wishes in the cliq."
 * 🗓️ Admin: "Don't forget: Saturday's game starts at 10AM. Bring water and sunscreen!"
 * ⚠️ Red Alert: "A safety concern was reported in this cliq. Our team is reviewing it."
 * ✅ Resolved: "A recent Red Alert in this cliq has been reviewed and addressed."
 */
