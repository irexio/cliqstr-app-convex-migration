'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type UserData = {
  id: string;
  name?: string;
  email: string;
  role: string;
  avatarUrl?: string;
  account?: {
    stripeStatus?: string;
    plan?: string;
  };
  myProfile?: {
    username?: string;
  };
};

type UserDropdownProps = {
  userData: UserData | null;
  handleSignOut: () => Promise<void>;
};

export function UserDropdown({ userData, handleSignOut }: UserDropdownProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!userData) {
    return null;
  }

  // Safe user display name
  const displayName = userData?.name || userData?.email?.split('@')?.[0] || 'User';
  const userRole = userData?.role?.toLowerCase() || 'user';
  const userId = userData?.id || '';
  const userInitials = (userData?.name || userData?.email || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
        className="relative focus:outline-none flex items-center gap-2"
        aria-label="Account menu"
      >
        <span className="hidden md:block text-sm font-medium">
          {displayName}
        </span>
        {/* Always show Account initials, never MyProfile avatar */}
        <div className="h-8 w-8 bg-gray-100 text-black rounded-full flex items-center justify-center text-sm font-medium">
          {userInitials}
        </div>
      </button>
      
      {/* User dropdown menu */}
      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-gray-500 capitalize">
              {userRole}
            </p>
            {userData.account?.stripeStatus && (
              <p className="text-xs text-gray-500 mt-1">
                Plan: <span className="font-medium capitalize">
                  {userData.account.plan || userData.account.stripeStatus || 'Free'}
                </span>
              </p>
            )}
          </div>
          
          <Link 
            href={userData.myProfile?.username ? '/profile' : '/profile/create'} 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            {userData.myProfile?.username ? 'Your Profile' : 'Create Profile'}
          </Link>
          
          {/* Edit Profile link - only show if user has a profile */}
          {userData.myProfile?.username && (
            <Link 
              href="/profile/edit" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsUserMenuOpen(false)}
            >
              Edit Profile
            </Link>
          )}
          
          <Link 
            href="/account" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            Account Settings
          </Link>
          
          {/* Show billing link only for adults and parents */}
          {(userData.role === 'PARENT' || userData.role === 'ADULT') && (
            <Link 
              href="/billing" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsUserMenuOpen(false)}
            >
              Billing & Plans
            </Link>
          )}
          
          {/* Show parent controls only for parents */}
          {userData.role === 'PARENT' && (
            <Link 
              href="/parent-controls" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsUserMenuOpen(false)}
            >
              Parent Controls
            </Link>
          )}
          
          <div className="border-t border-gray-100 mt-1">
            <button 
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                setIsUserMenuOpen(false);
                handleSignOut();
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
