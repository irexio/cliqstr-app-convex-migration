'use client'

// 🔐 APA-HARDENED by Aiden — Do not remove without explicit security review.
// Hero section for Cliqstr homepage. Uses official Kara color gradient.

import Link from 'next/link'

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-purple-600 to-pink-600 text-white py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
          Finally, a Private Space Just for Your Cliqs
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto">
          Cliqstr is invite-only, ad-free, and safe for families, kids, and friends to connect.
        </p>
        <div className="flex justify-center gap-4 flex-wrap pt-4">
          <Link
            href="/sign-up"
            className="rounded-full bg-white text-purple-700 font-semibold px-6 py-3 text-lg shadow-md hover:bg-gray-100 transition"
          >
            Try Cliqstr Free
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border border-white text-white font-medium px-6 py-3 text-lg hover:bg-white hover:text-purple-700 transition"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  )
}
