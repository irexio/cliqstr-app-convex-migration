'use client';

import SidebarNav from '@/components/SidebarNav';

export default function HowItWorksPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 px-6 py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>

        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">How It Works</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Understanding how Cliqstr helps you build better communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl bg-gray-100 shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">Create Your Cliq</h2>
              <p className="text-gray-700">
                Start by creating your own private or public cliq. Define your community’s purpose, set guidelines,
                and customize your space to reflect your group’s identity. You’re in charge.
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">Invite Members (Safely)</h2>
              <p className="text-gray-700">
                Only Cliq Admins can invite new members by default. You can allow trusted members to invite if you choose.
                This keeps things safe, intentional, and drama-free — especially for teens or kids.
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">Share & Connect</h2>
              <p className="text-gray-700">
                Post updates, photos, events, and more — all in a respectful, private space.
                No filters, no followers, just real conversations with the people who matter.
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">Grow Together (With Guardrails)</h2>
              <p className="text-gray-700">
                As your cliq grows, you’ll unlock tools for moderation, planning, and communication.
                AI-powered safety features automatically help ensure respectful behavior across all chats.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
