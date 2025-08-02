'use client';

import Link from 'next/link';

type DesktopNavProps = {
  isLoggedIn: boolean;
  isApproved: boolean; // Add APA approval status
};

export function DesktopNav({ isLoggedIn, isApproved }: DesktopNavProps) {
  // Show My Cliqs for all approved members
  const showMyCliqs = isLoggedIn && isApproved;
  
  return (
    <nav className="flex items-center gap-6 text-sm font-medium text-[#202020]">
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

      {/* Show My Cliqs for all approved members */}
      {showMyCliqs && (
        <Link href="/my-cliqs-dashboard" className="font-semibold hover:underline transition">
          My Cliqs
        </Link>
      )}
    </nav>
  );
}

export default DesktopNav;
