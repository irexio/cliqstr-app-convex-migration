'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

interface UserAvatarProps {
  /** User's uploaded image URL */
  image?: string | null;
  /** User's name for fallback generation */
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
 * Smart avatar component that handles fallbacks gracefully:
 * 1. Shows uploaded user image if available
 * 2. Falls back to DiceBear generated avatar based on name or userId
 * 3. Final fallback to initials if name is available
 * 
 * Perfect for users who haven't created profiles yet!
 */
export function UserAvatar({ 
  image, 
  name, 
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

  // Generate fallback avatar URL using DiceBear
  const generateFallbackAvatar = () => {
    if (name) {
      // Use name for more personalized avatar
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=c032d1,000000,6366f1,8b5cf6,ec4899&textColor=ffffff`;
    } else if (userId) {
      // Use userId as fallback
      return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userId)}&backgroundColor=c032d1,000000,6366f1,8b5cf6,ec4899`;
    } else {
      // Generic fallback
      return `https://api.dicebear.com/7.x/identicon/svg?seed=anonymous&backgroundColor=6b7280`;
    }
  };

  // Generate initials for final fallback
  const getInitials = () => {
    if (!name) return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const fallbackAvatarUrl = generateFallbackAvatar();

  // Avatar content component
  const AvatarContent = () => (
    <Avatar className={cn(sizeClasses[size], className)}>
      {/* Primary: User uploaded image */}
      {image && (
        <AvatarImage 
          src={image} 
          alt={name || 'User avatar'}
        />
      )}
      
      {/* Secondary: DiceBear generated avatar */}
      <AvatarImage 
        src={fallbackAvatarUrl}
        alt={name ? `${name}'s avatar` : 'Generated avatar'}
      />
      
      {/* Final fallback: Initials */}
      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
        {getInitials()}
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
 * 🎨 Avatar Behavior Matrix (from memory):
 * 
 * | Condition | Avatar Display |
 * |-----------|----------------|
 * | Has uploaded image | Show uploaded image |
 * | No image + has name | DiceBear initials with name |
 * | No image + no name + has userId | DiceBear identicon with userId |
 * | No data | Generic identicon + "?" initials |
 * 
 * 🌈 Color Palette:
 * - Purple: #c032d1 (Cliqstr brand)
 * - Black: #000000
 * - Blue: #6366f1
 * - Purple: #8b5cf6  
 * - Pink: #ec4899
 * - Gray: #6b7280 (fallback)
 */
