'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

const sidebarLinks: SidebarLink[] = [
  { href: '/about', label: 'About', icon: '🔒' },
  { href: '/safety', label: 'Safety', icon: '🛡️' },
  { href: '/faqs', label: 'FAQs', icon: '❓' },
  { href: '/how-it-works', label: 'How It Works', icon: '⚙️' },
  { href: '/for-parents', label: 'For Parents', icon: '👨‍👩‍👧‍👦' },
];

export function InfoSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Sidebar Handle */}
      <button
        className="md:hidden fixed left-0 top-1/2 transform -translate-y-1/2 bg-black text-white border-none py-3 px-2 rounded-r-lg cursor-pointer z-[1001] text-xs shadow-lg"
        style={{ writingMode: 'vertical-rl' }}
        onClick={() => setIsOpen(true)}
      >
        MENU
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[1000]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <nav
        className={`md:hidden fixed top-0 left-0 w-[300px] h-screen bg-black z-[1001] transition-transform duration-300 pt-20 pb-6 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          className="absolute top-5 right-5 bg-transparent border-none text-white text-2xl cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>

        {/* Profile section */}
        <div className="px-6 py-6 text-center border-b border-gray-800">
          <div className="w-[60px] h-[60px] rounded-full bg-white mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-600 text-2xl">👤</span>
          </div>
          <h3 className="text-white text-lg font-semibold">Information</h3>
        </div>

        {/* Navigation links */}
        <ul className="list-none m-0 p-0">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-6 py-4 text-white no-underline font-medium text-base transition-colors duration-200 hover:text-[#c032d1] ${
                  pathname === link.href ? 'text-[#c032d1]' : ''
                }`}
              >
                <span className="w-5 h-5 bg-white rounded flex items-center justify-center text-xs text-black flex-shrink-0">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block bg-black rounded-xl p-6 w-[250px] flex-shrink-0 h-fit">
        <nav>
          {/* Profile section */}
          <div className="pb-6 text-center border-b border-gray-800">
            <div className="w-[60px] h-[60px] rounded-full bg-white mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-600 text-2xl">👤</span>
            </div>
            <h3 className="text-white text-lg font-semibold">Information</h3>
          </div>

          {/* Navigation links */}
          <ul className="list-none m-0 p-0 pt-6">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 text-white no-underline font-medium text-base transition-colors duration-200 hover:text-[#c032d1] ${
                    pathname === link.href ? 'text-[#c032d1]' : ''
                  }`}
                >
                  <span className="w-5 h-5 bg-white rounded flex items-center justify-center text-xs text-black flex-shrink-0">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}