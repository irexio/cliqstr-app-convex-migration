'use client';

import SidebarNav from '@/components/SidebarNav';

const sidebarItems = [
  { title: 'About', href: '/about' },
  { title: 'How It Works', href: '/how-it-works' },
  { title: 'For Parents', href: '/for-parents' },
  // Add more if needed
];

export default function ForParentsPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 sm:px-6 py-12 sm:py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>

        <section className="space-y-12">
          {/* ... rest of your content */}
        </section>
      </div>
    </main>
  );
}
