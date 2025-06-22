'use client';

import SidebarNav from '@/components/SidebarNav';

export default function FAQPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 px-6 py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>        <section className="space-y-10">
          <div>
            <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Frequently Asked Questions</h1>

            <div className="space-y-6 text-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-[#202020] font-poppins">Who can create a cliq?</h2>
                <p>
                  Any verified adult on a paid or sponsored plan, or youth under 18 with parent-approved autonomy mode enabled.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#202020] font-poppins">Is Cliqstr free?</h2>
                <p>
                  We offer a free trial and sponsored access for approved families. Plans are simple, flat-rate, and ad-free.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#202020] font-poppins">Do you run ads?</h2>
                <p>
                  Never. Cliqstr is completely ad-free and does not sell your data.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#202020] font-poppins">How are youth accounts managed?</h2>
                <p>
                  All under-18 accounts require parent approval. Parents can enable or disable autonomy mode at any time.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#202020] font-poppins">Where is the Cliqstr Safety Page?</h2>
                <p>
                  You can find the full Cliqstr Safety Page linked at the bottom of the site in the footer.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
