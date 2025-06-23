'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#202020] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand / Intro */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold lowercase text-white font-poppins">cliqstr</h2>
            <p className="text-sm text-neutral-300">
              Cliqstr is a private social platform for families, friends, and safe online circles.
            </p>
            <p className="text-sm text-neutral-400 pt-4">
              🚧 Currently in beta. Interested in what we’re building? Email us:
            </p>
            <p className="text-sm text-neutral-300">
              💌 <a href="mailto:inquiry@cliqstr.com" className="underline hover:text-white">inquiry@cliqstr.com</a><br />
              🧙‍♀️ <a href="mailto:wizards@cliqstr.com" className="underline hover:text-white">wizards@cliqstr.com</a>
            </p>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Pages</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><Link href="/explore" className="hover:text-white transition">Explore Public Cliqs</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
              <li><Link href="/faqs" className="hover:text-white transition">FAQs</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/safety" className="hover:text-white transition">Cliqstr Safety</Link></li>
            </ul>
          </div>

          {/* Call to Action */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Start Your Cliq</h3>
            <p className="text-sm text-neutral-300 mb-4">Create a private space for the people you trust most.</p>
            <Link
              href="/sign-up"
              className="inline-block bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-12 border-t border-neutral-800 pt-6 text-xs text-neutral-400 text-center">
          &copy; {new Date().getFullYear()} Cliqstr. Built with ❤️ for families and friends.
        </div>
      </div>
    </footer>
  );
}
