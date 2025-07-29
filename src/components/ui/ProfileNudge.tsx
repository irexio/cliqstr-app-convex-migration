'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, User, Camera, Star, TrendingUp } from 'lucide-react';
import { calculateProfileCompletion, getContextualNudge, getEngagementStats } from '@/lib/utils/profileUtils';

interface ProfileNudgeProps {
  profile: {
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    about?: string | null;
    image?: string | null;
    bannerImage?: string | null;
  } | null;
  context: 'dashboard' | 'cliq-feed' | 'avatar-click' | 'post-creation' | 'cliq-join';
  className?: string;
  dismissible?: boolean;
  compact?: boolean;
}

export function ProfileNudge({ 
  profile, 
  context, 
  className = '', 
  dismissible = false,
  compact = false 
}: ProfileNudgeProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  
  const completion = calculateProfileCompletion(profile);
  const nudge = getContextualNudge(context, completion);
  const stats = getEngagementStats(!!profile);

  // Don't show if profile is complete or nudge has no message
  if (completion.percentage === 100 || !nudge.message || isDismissed) {
    return null;
  }

  // Priority-based styling
  const getPriorityStyles = () => {
    switch (nudge.priority) {
      case 'high':
        return 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950/20 dark:to-purple-950/20 dark:border-blue-800';
      case 'medium':
        return 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 dark:from-green-950/20 dark:to-blue-950/20 dark:border-green-800';
      case 'low':
        return 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 dark:from-gray-950/20 dark:to-blue-950/20 dark:border-gray-700';
    }
  };

  const getIcon = () => {
    switch (context) {
      case 'avatar-click':
        return <Camera className="w-5 h-5 text-blue-600" />;
      case 'post-creation':
        return <Camera className="w-5 h-5 text-green-600" />;
      case 'cliq-join':
        return <User className="w-5 h-5 text-purple-600" />;
      case 'cliq-feed':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      default:
        return <Star className="w-5 h-5 text-blue-600" />;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${getPriorityStyles()} ${className}`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
            {nudge.message}
          </p>
        </div>
        <Link
          href="/profile/create"
          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
        >
          {nudge.cta}
        </Link>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${getPriorityStyles()} ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-white/50 rounded-lg dark:bg-gray-800/50">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {completion.percentage === 0 ? 'Complete Your Profile' : 'Profile Progress'}
            </h3>
            {dismissible && (
              <button
                onClick={() => setIsDismissed(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {nudge.message}
          </p>

          {nudge.showProgress && completion.percentage > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{completion.percentage}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Benefits preview */}
          {completion.percentage < 60 && (
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <span>🎉</span>
                <span>Birthday celebrations</span>
              </div>
              <div className="flex items-center gap-1">
                <span>💬</span>
                <span>3x more engagement</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link
              href="/profile/create"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
            >
              {nudge.cta}
            </Link>
            
            {context === 'dashboard' && completion.percentage > 0 && (
              <Link
                href="/profile"
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                View Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Specialized nudge components for specific contexts
export function DashboardProfileNudge({ profile }: { profile: ProfileNudgeProps['profile'] }) {
  return (
    <ProfileNudge
      profile={profile}
      context="dashboard"
      dismissible={true}
      className="mb-6"
    />
  );
}

export function CliqFeedProfileNudge({ profile }: { profile: ProfileNudgeProps['profile'] }) {
  return (
    <ProfileNudge
      profile={profile}
      context="cliq-feed"
      compact={true}
      dismissible={true}
      className="mb-4"
    />
  );
}

export function AvatarClickNudge({ profile }: { profile: ProfileNudgeProps['profile'] }) {
  return (
    <ProfileNudge
      profile={profile}
      context="avatar-click"
      compact={true}
    />
  );
}

export function PostCreationNudge({ profile }: { profile: ProfileNudgeProps['profile'] }) {
  return (
    <ProfileNudge
      profile={profile}
      context="post-creation"
      compact={true}
      dismissible={true}
      className="mb-3"
    />
  );
}
