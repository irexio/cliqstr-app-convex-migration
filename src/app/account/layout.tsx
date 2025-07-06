import React from 'react';
import Link from 'next/link';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-black text-white py-12 px-6 gap-6 border-r border-neutral-200">
        <h2 className="text-xl font-bold mb-8 font-poppins">Account</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/account" className="py-2 px-3 rounded bg-white text-black font-semibold hover:bg-neutral-100 transition">
            Account Info
          </Link>
          {/* Future: <Link href="/account/security" className="py-2 px-3 rounded hover:bg-neutral-900 transition">Security</Link> */}
          {/* Future: <Link href="/account/notifications" className="py-2 px-3 rounded hover:bg-neutral-900 transition">Notifications</Link> */}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 px-4 md:px-12 py-12">{children}</main>
    </div>
  );
}
