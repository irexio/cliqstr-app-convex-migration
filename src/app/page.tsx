// 🔐 APA-HARDENED by Aiden — public homepage entrypoint
// This page renders a hero, why section, public cliq previews, and CTA.
// No sensitive data is shown. PublicCliqs cannot be joined unless the user is authenticated and approved.

'use client';

import { Hero } from '@/components/Hero';
import { WhyChooseCliqstr } from '@/components/WhyChooseCliqstr';
import { InnerCircleCTA } from '@/components/InnerCircleCTA';

export default function HomePage() {
  return (
    <main className="space-y-8">

      {/* HERO */}
      <section>
        <Hero />
      </section>

      {/* WHY CHOOSE CLIQSTR */}
      <section>
        <WhyChooseCliqstr />
      </section>

      {/* INNER CIRCLE CTA */}
      <section>
        <InnerCircleCTA />
      </section>

    </main>
  );
}
