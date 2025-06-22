'use client';

import SidebarNav from '@/components/SidebarNav';

export default function FeaturesPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 px-6 py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>        <section className="space-y-10">
          <div>
            <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Platform Features</h1>
            <ul className="list-disc list-inside space-y-4 text-gray-700">
              <li><strong>No ads, ever:</strong> We don't monetize your attention or sell your data.</li>
              <li><strong>Private Cliqs:</strong> Create invite-only groups for your family, friends, or community.</li>
              <li><strong>Role-Based Access:</strong> Youth Creators, Linked Children, Invited Members — all with tailored permissions.</li>
              <li><strong>Theme Switching:</strong> Let members personalize their space with color palettes.</li>
              <li><strong>Safe By Design:</strong> Built-in guardrails for content moderation, youth protection, and privacy.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
