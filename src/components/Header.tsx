'use client';

// 🔐 APA-HARDENED HEADER FOR CLIQSTR
// Displays nav, role-aware buttons, brand styling. Must not reveal sensitive info.
// Verified: 2025-06-20

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function Header() {
  const [hasCliqs, setHasCliqs] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return;
        const data = await res.json();

        if (data?.id) {
          setIsLoggedIn(true);
          setHasCliqs(data.memberships?.length > 0);
        }
      } catch (err) {
        console.error('Error fetching /api/me:', err);
      }
    }

    fetchUser();
  }, []);

  return (    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 font-poppins">
        <div className="flex items-center justify-between">          {/* Logo */}
          <Link href="/" className="text-4xl font-bold text-[#202020] lowercase font-poppins">
            cliqstr
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#202020]">
            {hasCliqs && (
              <Link
                href="/my-cliqs"
                className="bg-[#d176e1] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#b65fc6] transition"
              >
                My Cliqs
              </Link>
            )}
            <Link href="/explore" className="hover:text-[#d176e1] transition">Explore Public Cliqs</Link>
            <Link href="/how-it-works" className="hover:text-[#d176e1] transition">How It Works</Link>
            <Link href="/about" className="hover:text-[#d176e1] transition">About</Link>
            <Link href="/faqs" className="hover:text-[#d176e1] transition">FAQs</Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {!isLoggedIn ? (
              <>
                <Link href="/sign-in" className="text-[#202020] hover:text-[#d176e1] transition">Sign In</Link>
                <Link
                  href="/sign-up"
                  className="bg-[#202020] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#5939d4] transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <span className="text-[#202020]">Welcome</span>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#202020] hover:text-[#d176e1] transition"
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
              {hasCliqs && (
                <Link
                  href="/my-cliqs"
                  className="bg-[#d176e1] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#b65fc6] transition text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Cliqs
                </Link>
              )}
              <Link 
                href="/explore" 
                className="hover:text-[#d176e1] transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Public Cliqs
              </Link>
              <Link 
                href="/how-it-works" 
                className="hover:text-[#d176e1] transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="/about" 
                className="hover:text-[#d176e1] transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/faqs" 
                className="hover:text-[#d176e1] transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQs
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                {!isLoggedIn ? (
                  <>
                    <Link 
                      href="/sign-in" 
                      className="text-[#202020] hover:text-[#d176e1] transition py-2 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="bg-[#202020] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#5939d4] transition text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <span className="text-[#202020] py-2 text-center">Welcome</span>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
