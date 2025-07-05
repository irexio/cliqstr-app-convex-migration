'use client';

import Link from 'next/link';

type DesktopNavProps = {
  isLoggedIn: boolean;
};

export function DesktopNav({ isLoggedIn }: DesktopNavProps) {
  return (
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
  );
}

export default DesktopNav;
