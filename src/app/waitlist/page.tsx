// src/app/waitlist/page.tsx
import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import MailerLiteEmbed from '@/components/MailerLiteEmbed';

export const metadata: Metadata = {
  title: 'Join the Waitlist • Cliqstr',
  robots: { index: false, follow: false },
};

export default function WaitlistPage() {
  const shareUrl = process.env.NEXT_PUBLIC_MAILERLITE_SHARE_URL;

  return (
    <main>
      {/* HERO */}
      <section>
        <Hero showCTAs={false} />
      </section>

      {/* EMOTIONAL CORE */}
      <section className="px-6 py-12 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 text-[#202020]">
        <div>
          <h2 className="text-xl font-semibold">Quiet by Design</h2>
          <p className="mt-2">Social media today feels like shouting into a crowd. Cliqstr is different: calm, ad-free, built for real connection.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Real People, Real Privacy</h2>
          <p className="mt-2">Your cliq is invite-only. No algorithms, no ads—just people you trust.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Family-Friendly from Day One</h2>
          <p className="mt-2">Built for parents and kids with safety features that make sense out of the box.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Own Your Space</h2>
          <p className="mt-2">You control membership, visibility, and what matters. We just make it easy.</p>
        </div>
      </section>

      {/* SIGNUP FORM */}
      <section className="px-6 pb-20 max-w-3xl mx-auto">
        {shareUrl ? (
          <MailerLiteEmbed shareUrl={shareUrl} className="rounded-lg overflow-hidden shadow-sm border border-neutral-200" height={520} />
        ) : (
          <div className="p-6 border border-dashed border-neutral-300 rounded-md text-center text-sm text-neutral-600">
            <p>Set NEXT_PUBLIC_MAILERLITE_SHARE_URL in Vercel env to render the signup form.</p>
          </div>
        )}
      </section>
    </main>
  );
}
