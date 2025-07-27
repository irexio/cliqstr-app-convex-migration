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
  myProfile?: {
    username: string;
  };
};

export function HeaderComponent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isApproved, setIsApproved] = useState(false); // Track APA approval status
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
      console.log('[Header] Attempting to sign out');
      const res = await fetch('/api/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (res.ok) {
        console.log('[Header] Sign out successful');
      } else {
        console.warn('[Header] Sign out response not OK:', res.status);
      }
      
      // Always clean up state regardless of response
      setIsLoggedIn(false);
      setIsApproved(false); // Reset APA approval status
      setUserData(null);
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('[Header] Sign out failed:', error);
      // Even if API call fails, clear client state for safety
      setIsLoggedIn(false);
      setIsApproved(false); // Reset APA approval status
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

  // Fetch user data and authentication status - simplified to just check if logged in
  const fetchUser = async () => {
    try {
      console.log('[Header] Attempting to fetch auth status');
      
      // Try the primary endpoint first
      try {
        const res = await fetch('/api/auth/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          
          // Check if we have user data (it's wrapped in a 'user' object)
          const userData = data?.user || data;
          
          // If we have a user ID, they're logged in
          if (userData?.id) {
            console.log('[Header] User authenticated:', userData.id);
            setIsLoggedIn(true);
            setIsApproved(userData.account?.isApproved === true || userData.approved === true);
            
            // Set minimal user data needed for the dropdown
            setUserData({
              id: userData.id,
              name: userData.myProfile?.firstName || userData.myProfile?.name || userData.email?.split('@')[0] || 'User',
              email: userData.email || '',
              role: userData.account?.role || userData.role || '',
              // Do not pass MyProfile avatar - header shows Account initials only
              account: userData.account,
              myProfile: userData.myProfile ? {
                username: userData.myProfile.username || userData.email?.split('@')[0] || 'user',
              } : undefined,
            });
            return;
          }
        }
      } catch (primaryErr) {
        console.warn('[Header] Primary auth endpoint failed:', primaryErr);
      }
      
      // If primary endpoint failed, try the fallback endpoint
      try {
        console.log('[Header] Trying fallback auth endpoint');
        const res = await fetch('/auth/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          
          // Check if we have user data (it's wrapped in a 'user' object)
          const userData = data?.user || data;
          
          // If we have a user ID, they're logged in
          if (userData?.id) {
            console.log('[Header] User authenticated via fallback:', userData.id);
            setIsLoggedIn(true);
            setIsApproved(userData.account?.isApproved === true || userData.approved === true);
            
            // Set minimal user data needed for the dropdown
            setUserData({
              id: userData.id,
              name: userData.myProfile?.firstName || userData.myProfile?.name || userData.email?.split('@')[0] || 'User',
              email: userData.email || '',
              role: userData.account?.role || userData.role || '',
              // Do not pass MyProfile avatar - header shows Account initials only
              account: userData.account,
              myProfile: userData.myProfile ? {
                username: userData.myProfile.username || userData.email?.split('@')[0] || 'user',
              } : undefined,
            });
            return;
          }
        }
      } catch (fallbackErr) {
        console.error('[Header] Fallback auth endpoint also failed:', fallbackErr);
      }
      
      // If we get here, user is not logged in
      console.log('[Header] No valid auth response, setting as logged out');
      setIsLoggedIn(false);
      setUserData(null);
      
    } catch (err) {
      console.error('[Header] Error in auth flow:', err);
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  useEffect(() => {
    fetchUser();
    
    // Set up interval to periodically check auth status (every 5 minutes)
    const interval = setInterval(() => {
      fetchUser();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 py-6 font-poppins">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-4xl font-bold text-[#202020] lowercase font-poppins">
            cliqstr
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav isLoggedIn={isLoggedIn} isApproved={isApproved} />

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {isLoggedIn ? (
              <UserDropdown userData={userData} handleSignOut={handleSignOut} />
            ) : (
              <>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 text-black border border-gray-300 hover:border-[#c032d1] px-4 py-2 rounded-full shadow-sm transition-all hover:shadow"
                >
                  <span>Join with <span className="font-bold">Invite</span></span>
                </button>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 border border-black text-black rounded-full hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 bg-black text-white rounded-full hover:bg-[#c032d1] transition"
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
