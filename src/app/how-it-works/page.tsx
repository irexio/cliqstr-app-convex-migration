'use client';

import SidebarNav from '@/components/SidebarNav';

export default function HowItWorksPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 sm:px-6 py-12 sm:py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>

        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-[#202020] mb-2 font-poppins">How Cliqstr Works</h1>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              Cliqstr helps kids, families, and small groups connect safely — without ads, algorithms, or chaos. Here's how to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#202020] mb-2 font-poppins">1. Create Your Cliq</h2>
              <p className="text-gray-700 text-sm sm:text-base">
                Choose your cliq type:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Private</strong>: Only approved members can view or join</li>
                  <li><strong>Semi-Private</strong>: Discoverable, but requires approval</li>
                  <li><strong>Public</strong>: Anyone can see it, but only invited members can post</li>
                </ul>
                Every cliq includes privacy settings and customization so it reflects your purpose.
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#202020] mb-2 font-poppins">2. Invite Members (Safely)</h2>
              <p className="text-gray-700 text-sm sm:text-base">
                Invite logic keeps every group intentional and safe:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Parents must approve invites involving minors</li>
                  <li>Adults can invite other adults directly</li>
                  <li>Admins control who can send invites or manage members</li>
                </ul>
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#202020] mb-2 font-poppins">3. Share & Connect</h2>
              <p className="text-gray-700 text-sm sm:text-base">
                Post updates, photos, comments, or creative work in a private, ad-free environment. No followers, no pressure. Just real conversation with people who matter.
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#202020] mb-2 font-poppins">4. Grow with Guardrails</h2>
              <p className="text-gray-700 text-sm sm:text-base">
                As your cliq grows, so do your tools:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>AI moderation flags harmful content early</li>
                  <li>Role-based permissions keep access appropriate</li>
                  <li>Parent dashboards support silent monitoring when needed</li>
                </ul>
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6 md:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold text-[#202020] mb-2 font-poppins">5. Coming Soon: Homework Helpline</h2>
              <p className="text-gray-700 text-sm sm:text-base">
                Our optional AI support tool helps kids stay focused, explore new topics, and build confidence with their schoolwork. It offers thoughtful prompts and mindset resets — never answers — and supports healthy learning habits at home.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
