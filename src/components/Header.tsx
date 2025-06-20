'use client';

// 🔐 APA-HARDENED HEADER FOR CLIQSTR
// Displays nav, role-aware buttons, brand styling. Must not reveal sensitive info.
// Verified: 2025-06-20

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Header() {
  const [hasCliqs, setHasCliqs] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-poppins">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#202020] lowercase">
          cliqstr
        </Link>

        {/* Nav Links */}
        <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#202020]">
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
          <Link href="/faq" className="hover:text-[#d176e1] transition">FAQs</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4 text-sm">
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
      </div>
    </header>
  );
}
