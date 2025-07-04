'use client'

// 🔐 APA-HARDENED HEADER FOR CLIQSTR — now penguin-pure ⚫⚪
// Uses /auth/status to detect login state (no /api/)
// Verified: 2025-06-27

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bars3Icon, XMarkIcon, TicketIcon } from '@heroicons/react/24/outline'
import InviteCodeModal from './InviteCodeModal'

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasCliqs, setHasCliqs] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/auth/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data?.id) {
          setIsLoggedIn(true);
          setHasCliqs(data.memberships?.length > 0);
        }
      } catch (err) {
        console.error('Error fetching /auth/status:', err);
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
