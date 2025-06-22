'use client';

import SidebarNav from '@/components/SidebarNav';

export default function SafetyPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 px-6 py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>

        <section className="space-y-10">
          <div>
            <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Cliqstr Safety</h1>
            <p className="text-gray-700 text-lg">
              Cliqstr is designed from the ground up to protect children, support families, and ensure every member
              feels safe and respected.
            </p>
          </div>

          <div className="space-y-6 text-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">Parental Controls</h2>
              <p>
                Parents can approve or deny invites, customize permissions for youth accounts, and receive notifications
                for activity that may require their attention.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">Content Moderation</h2>
              <p>
                All posts are screened by AI moderation backed by human review. Suspicious or harmful content is flagged
                before it can reach your child’s feed.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">Invite-Only Access</h2>
              <p>
                No strangers allowed. Cliqs are invitation-only, and even those require verification and approval for underage users.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#202020] mb-2 font-poppins">No Ads or Tracking</h2>
              <p>
                We will never run ads, sell your data, or allow third-party trackers. Your privacy is non-negotiable.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
