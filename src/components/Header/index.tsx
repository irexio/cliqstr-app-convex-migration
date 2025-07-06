'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

import DesktopNav from './DesktopNav';
import UserDropdown from './UserDropdown';
import MobileMenu from './MobileMenu';
import InviteCodeModal from '../InviteCodeModal';

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
  profile?: {
    username: string;
  };
};

export function HeaderComponent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCliqs, setHasCliqs] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Session timeout in milliseconds (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      // Always clean up state regardless of response
      setIsLoggedIn(false);
      setUserData(null);
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
      // Even if API call fails, clear client state for safety
      setIsLoggedIn(false);
      setUserData(null);
      window.location.href = '/';
    }
  };
  
  // Function to handle auto logout
  const handleAutoLogout = async () => {
    console.log('[Header] Auto logout triggered due to inactivity');
    await handleSignOut();
  };

  // Update last activity on user interactions
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Listen for user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('touchmove', updateActivity);
    window.addEventListener('scroll', updateActivity);
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('touchmove', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [isLoggedIn]);
  
  // Check for session timeout
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        console.log('[Header] Session timeout detected');
        handleAutoLogout();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [isLoggedIn, lastActivity]);

  // Fetch user data and authentication status
  useEffect(() => {
    async function fetchUser() {
      try {
        console.log('[Header] Attempting to fetch auth status');
        const res = await fetch('/auth/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include',
        });

        // Handle failure cases explicitly
        if (!res.ok) {
          console.log('[Header] Auth status response not OK, setting as logged out');
          setIsLoggedIn(false);
          setUserData(null);
          return;
        }

        // Parse response with error handling
        let data;
        try {
          data = await res.json();
        } catch (err) {
          console.error('[Header] Error parsing auth status response:', err);
          setIsLoggedIn(false);
          setUserData(null);
          return;
        }

        if (data?.id) {
          console.log('[Header] User authenticated:', data.id);
          setIsLoggedIn(true);
          setHasCliqs(Array.isArray(data.memberships) && data.memberships.length > 0);
          setUserData({
            id: data.id,
            name: data.profile?.name || undefined,
            email: data.email || '',
            role: data.role || '',
            avatarUrl: data.profile?.image || undefined,
            account: data.account || undefined,
            profile: {
              username: data.profile?.username || data.email?.split('@')[0] || 'user',
            },
          });
        } else {
          console.log('[Header] No user ID in response, setting as logged out');
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (err) {
        console.error('Error fetching /auth/status:', err);
        setIsLoggedIn(false);
        setUserData(null);
      }
    }

    fetchUser();
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 font-poppins">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-4xl font-bold text-[#202020] lowercase font-poppins">
            cliqstr
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav isLoggedIn={isLoggedIn} />

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {isLoggedIn ? (
              <UserDropdown userData={userData} handleSignOut={handleSignOut} />
            ) : (
              <>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="flex items-center bg-gradient-to-r from-purple-100 to-gray-100 text-black border border-purple-200 hover:border-[#c032d1] px-3 py-2 rounded-full shadow-sm transition-all hover:shadow"
                >
                  <span>Join with <span className="font-bold">Invite</span></span>
                </button>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 border border-black text-black rounded hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#202020] hover:text-black transition"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <MobileMenu 
          isLoggedIn={isLoggedIn}
          userData={userData}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          setInviteModalOpen={setInviteModalOpen}
          handleSignOut={handleSignOut}
        />
      </div>
      
      {/* Invite Code Modal */}
      <InviteCodeModal open={inviteModalOpen} setOpen={setInviteModalOpen} />
    </header>
  );
}

export default HeaderComponent;
