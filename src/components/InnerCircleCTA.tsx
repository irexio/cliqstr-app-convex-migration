'use client';

// 🔐 APA-HARDENED by Aiden — Do not remove without review.
// This CTA invites users to begin their Cliqstr journey in a gentle, welcoming tone.
// Background softened to bg-gray-50 and colors made accessible.

import Link from 'next/link';

export function InnerCircleCTA() {
  return (
    <section className="bg-gray-50 text-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Join Your Inner Circle
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          Cliqstr was built for real relationships — not followers, not noise. 
          Create your first cliq and invite only the people who truly matter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="inline-block bg-black text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-neutral-800 transition"
          >
            Start Free Trial
          </Link>
          <Link
            href="/how-it-works"
            className="text-gray-900 underline hover:text-primary transition"
          >
            Learn how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
