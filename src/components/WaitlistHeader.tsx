'use client';
import Link from 'next/link';

export function WaitlistHeader() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-4xl font-bold text-[#202020] lowercase font-poppins">
            cliqstr
          </Link>
        </div>
      </div>
    </header>
  );
}
