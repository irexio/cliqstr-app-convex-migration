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

          <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">1. Create Your Cliq</h2>
            <h3 className="font-semibold mt-2">Choose Your Cliq Type</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Private:</strong> Invite-only. Only people you personally invite can join. Hidden from search.</li>
              <li><strong>Semi-Private:</strong> Discoverable in search. Members can request to join — or be invited by someone already in the group.</li>
              <li><strong>Public:</strong> Open to eligible users based on age group. Anyone who qualifies can find and join — but moderation and approvals still apply to keep things safe.</li>
            </ul>
            <p className="text-gray-700 text-sm sm:text-base mt-2">Every cliq has privacy settings and tools to shape the kind of space you want to create.</p>
          </div>

          <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">2. Invite Members (the Safe Way)</h2>
            <p className="text-gray-700 text-sm sm:text-base">Cliqstr invites are built for trust — not virality.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Parents must approve any invites involving minors</li>
              <li>Adults can invite other adults directly</li>
              <li>Cliq owners decide who can send invites or manage members</li>
            </ul>
            <p className="text-gray-700 text-sm sm:text-base mt-2">Every invite is intentional, not random. That’s the point.</p>
          </div>

          <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6">
  <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">3. Share & Connect</h2>
  <p className="text-gray-700 text-sm sm:text-base">
    Post updates, photos, creative work, or questions — in a space built for trust, not likes.<br />
    There’s no pressure to perform. Just honest, expressive feedback from the people in your cliq.
  </p>
</div>

          <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">4. Meaningful Connections, Grown Safely</h2>
            <p className="text-gray-700 text-sm sm:text-base">Cliqstr makes it easy to build strong, supportive cliqs — without unwelcome, intrusive distractions.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>AI quietly flags harmful or off-topic content</li>
              <li>Role-based permissions keep access and actions appropriate</li>
              <li>Parents have oversight tools in cliqs involving minors</li>
            </ul>
            <p className="text-gray-700 text-sm sm:text-base mt-2">From the start, every connection is shaped by intention — and protected by design.<br />Your cliq grows, but never outgrows its purpose.</p>
          </div>

          <div className="rounded-xl bg-gray-100 shadow-sm p-5 sm:p-6 md:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold text-[#202020] mb-2 font-poppins">5. Coming Soon: Homework Helpline</h2>
            <p className="text-gray-700 text-sm sm:text-base">
              Our optional AI support tool helps kids stay focused, explore new topics, and build confidence with their schoolwork. It offers thoughtful prompts and mindset resets — never answers — and supports healthy learning habits at home.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
