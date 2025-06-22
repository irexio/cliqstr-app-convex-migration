'use client';

import SidebarNav from '@/components/SidebarNav';

export default function AboutPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 px-6 py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>

        <section className="space-y-10">
          <div>
            <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">About Cliqstr</h1>
            <p className="text-lg text-gray-700">
              Cliqstr is a private, ad-free platform built for families, friends, and trusted groups.
              We believe in safe spaces where people can connect without being tracked, targeted,
              or manipulated by algorithms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">Why We Exist</h2>
            <p className="text-gray-700">
              Existing social media platforms prioritize engagement at any cost.
              Cliqstr is different — we prioritize trust, intention, and community.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">What Makes Us Different</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>No ads, ever</li>
              <li>No tracking or third-party data sharing</li>
              <li>Role-based access for youth, adults, and parents</li>
              <li>Built-in privacy — every cliq is its own space</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
