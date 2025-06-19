'use client';

import { Hero } from '@/components/Hero';
import { WhyChooseCliqstr } from '@/components/WhyChooseCliqstr';
import PublicCliqs from '@/components/PublicCliqs'; // ✅ FIXED HERE
import { InnerCircleCTA } from '@/components/InnerCircleCTA';

export default function HomePage() {
  return (
    <main className="bg-white text-neutral-900 font-poppins">
      {/* HERO SECTION */}
      <section>
        <div className="p-4 text-xs text-neutral-500">Rendering: Hero</div>
        <Hero />
      </section>

      {/* WHY CHOOSE CLIQSTR */}
      <section>
        <div className="p-4 text-xs text-neutral-500">Rendering: WhyChooseCliqstr</div>
        <WhyChooseCliqstr />
      </section>

      {/* PUBLIC CLIQS */}
      <section>
        <div className="p-4 text-xs text-neutral-500">Rendering: PublicCliqs</div>
        <PublicCliqs />
      </section>

      {/* INNER CIRCLE CTA */}
      <section>
        <div className="p-4 text-xs text-neutral-500">Rendering: InnerCircleCTA</div>
        <InnerCircleCTA />
      </section>
    </main>
  );
}
