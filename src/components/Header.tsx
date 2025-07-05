'use client'

// 🔐 APA-HARDENED HEADER FOR CLIQSTR — now penguin-pure ⚫⚪
// Uses /auth/status to detect login state (no /api/)
// Verified: 2025-06-27

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Bars3Icon, XMarkIcon, TicketIcon } from '@heroicons/react/24/outline'
import InviteCodeModal from './InviteCodeModal'

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasCliqs, setHasCliqs] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [userData, setUserData] = useState<null | {
    id: string;
    name?: string;
    email: string;
    role: string;
    avatarUrl?: string;
    account?: {
      stripeStatus?: string;
      plan?: string;
    }
  }>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        console.log('[Header] Attempting to fetch auth status');
        const res = await fetch('/auth/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include', // Critical: Include cookies in the request
        });

        // Make sure to explicitly set isLoggedIn to false if not authenticated
        if (!res.ok) {
          console.log('[Header] Auth status response not OK, setting as logged out');
          setIsLoggedIn(false);
          return;
        }

        const data = await res.json();

        if (data?.id) {
          console.log('[Header] User authenticated:', data.id);
          setIsLoggedIn(true);
          setHasCliqs(data.memberships?.length > 0);
          setUserData({
            id: data.id,
            name: data.profile?.name || data.email.split('@')[0],
            email: data.email,
            role: data.role,
            avatarUrl: data.profile?.image,
            account: data.account
          });
        } else {
          console.log('[Header] No user ID in response, setting as logged out');
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (err) {
        console.error('Error fetching /auth/status:', err);
        setIsLoggedIn(false); // Explicitly set to false on error
      }
    }

    fetchUser()
  }, [])

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 font-poppins">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-4xl font-bold text-[#202020] lowercase font-poppins">
            cliqstr
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#202020]">
            <Link href="/explore" className="text-gray-700 hover:text-black transition">
              Explore Public Cliqs
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-black transition">
              How It Works
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-black transition">
              About
            </Link>
            <Link href="/faqs" className="text-gray-700 hover:text-black transition">
              FAQs
            </Link>

            {isLoggedIn && (
              <Link href="/my-cliqs" className="font-semibold hover:underline transition">
                My Cliqs
              </Link>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {isLoggedIn && userData ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                  className="relative focus:outline-none"
                  aria-label="Account menu"
                >
                  {userData.avatarUrl ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={userData.avatarUrl}
                        alt={userData.name || "User"}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                      {userData.name ? userData.name.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                  )}
                </button>
                
                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{userData.name || userData.email.split('@')[0]}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {userData.role.toLowerCase()}
                      </p>
                      {userData.account?.stripeStatus && (
                        <p className="text-xs text-gray-500 mt-1">
                          Plan: <span className="font-medium capitalize">{userData.account.plan || userData.account.stripeStatus}</span>
                        </p>
                      )}
                    </div>
                    
                    <Link 
                      href={`/profile/${userData.id}`} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    
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
                      <Link 
                        href="/api/sign-out" 
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign Out
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="flex items-center bg-gradient-to-r from-purple-100 to-gray-100 text-black border border-purple-200 hover:border-[#c032d1] px-3 py-2 rounded-full shadow-sm transition-all hover:shadow"
                >
                  <TicketIcon className="h-4 w-4 mr-1 text-[#c032d1]" />
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
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 text-sm font-medium text-[#202020]">
              <Link
                href="/explore"
                className="hover:text-black transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Public Cliqs
              </Link>
              <Link
                href="/how-it-works"
                className="hover:text-black transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/about"
                className="hover:text-black transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/faqs"
                className="hover:text-black transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQs
              </Link>

              {isLoggedIn && (
                <Link
                  href="/my-cliqs"
                  className="font-semibold text-center hover:underline transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Cliqs
                </Link>
              )}

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                {isLoggedIn && userData ? (
                  <>
                    <div className="flex items-center mb-2 px-2">
                      {userData.avatarUrl ? (
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 mr-2">
                          <Image
                            src={userData.avatarUrl}
                            alt={userData.name || "User"}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium mr-2">
                          {userData.name ? userData.name.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{userData.name || userData.email.split('@')[0]}</p>
                        <p className="text-xs text-gray-500 capitalize">{userData.role.toLowerCase()}</p>
                      </div>
                    </div>

                    <Link 
                      href={`/profile/${userData.id}`} 
                      className="px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    
                    <Link 
                      href="/account" 
                      className="px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>

                    {/* Show billing link only for adults and parents */}
                    {(userData.role === 'PARENT' || userData.role === 'ADULT') && (
                      <Link 
                        href="/billing" 
                        className="px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-100 rounded"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Billing & Plans
                      </Link>
                    )}

                    {/* Show parent controls only for parents */}
                    {userData.role === 'PARENT' && (
                      <Link 
                        href="/parent-controls" 
                        className="px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-100 rounded"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Parent Controls
                      </Link>
                    )}

                    <Link 
                      href="/api/sign-out" 
                      className="mt-2 px-4 py-2 text-sm text-center text-red-600 hover:bg-gray-100 rounded"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Out
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setInviteModalOpen(true);
                      }}
                      className="flex items-center justify-center text-sm bg-gradient-to-r from-purple-100 to-gray-100 text-black border border-purple-200 hover:border-[#c032d1] px-3 py-2 rounded-full shadow-sm w-full my-2"
                    >
                      <TicketIcon className="h-4 w-4 mr-1 text-[#c032d1]" />
                      <span>Join with <span className="font-bold">Invite</span></span>
                    </button>
                    <Link
                      href="/sign-in"
                      className="px-4 py-2 border border-black text-black rounded text-center hover:bg-gray-100 transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="px-4 py-2 bg-black text-white rounded text-center hover:bg-gray-800 transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Invite Code Modal */}
      <InviteCodeModal open={inviteModalOpen} setOpen={setInviteModalOpen} />
    </header>
  )
}
