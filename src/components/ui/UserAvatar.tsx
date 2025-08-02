'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

interface UserAvatarProps {
  /** User's uploaded image URL from myProfile.image */
  image?: string | null;
  /** User's name for alt text (legacy support) */
  name?: string | null;
  /** User's ID for consistent fallback generation */
  userId?: string;
  /** Username for profile linking */
  username?: string | null;
  /** Whether user has a complete profile */
  hasProfile?: boolean;
  /** Size classes for the avatar */
  className?: string;
  /** Size preset - affects both avatar and fallback image */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the avatar should be clickable */
  clickable?: boolean;
}

/**
 * 🎭 UserAvatar Component
 * 
 * Simple avatar component for social profiles:
 * 1. Shows myProfile.image if available
 * 2. Falls back to plain grey circular icon
 * 3. No initials or complex fallback logic
 * 
 * Avatar is tied to social profile only!
 */
export function UserAvatar({ 
  image, 
  name, // legacy support
  userId,
  username,
  hasProfile = false,
  className,
  size = 'md',
  clickable = true
}: UserAvatarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Size mappings
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Avatar content component
  const AvatarContent = () => (
    <Avatar className={cn(sizeClasses[size], className)}>
      {/* Primary: User uploaded image from myProfile.image */}
      {image && (
        <AvatarImage 
          src={image} 
          alt={name || username || 'User avatar'}
        />
      )}
      
      {/* Fallback: Plain grey circular icon */}
      <AvatarFallback className="bg-gray-300 text-gray-600">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <circle cx="12" cy="8" r="4" fill="currentColor"/>
          <path d="M4 20c0-4 8-4 8-4s8 0 8 4" fill="currentColor"/>
        </svg>
      </AvatarFallback>
    </Avatar>
  );

  // If not clickable, return avatar directly
  if (!clickable) {
    return <AvatarContent />;
  }

  // If clickable but no profile, show tooltip
  if (!hasProfile || !username) {
    return (
      <div 
        className="relative cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AvatarContent />
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
            No profile yet
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  }

  // If clickable and has profile, make it a link
  return (
    <Link 
      href={`/profile/${username}`}
      className="hover:opacity-80 transition-opacity cursor-pointer"
      title={`View ${name || username}'s profile`}
    >
      <AvatarContent />
    </Link>
  );
}

/**
 * 🎨 Avatar Behavior Matrix:
 * 
 * | Condition | Avatar Display |
 * |-----------|----------------|
 * | Has myProfile.image | Show uploaded image |
 * | No myProfile.image | Plain grey circular icon |
 * 
 * 🎨 Design:
 * - Background: bg-gray-300 (light grey)
 * - Icon: Generic person silhouette
 * - Always circular and never empty
 * - No initials, text, or external services
 * - Avatar tied to social profile only
 */
