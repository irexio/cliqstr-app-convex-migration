import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Under Development • Cliqstr',
  robots: { index: false, follow: false },
};

export default function UnderDevelopmentPage() {
  return (
    <main className="min-h-[50vh] flex items-center justify-center px-6 py-16 bg-white text-[#202020]">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-3">This page is under development</h1>
        <p className="text-base text-gray-700 mb-6">
          We’re actively rebuilding our interior pages for the upcoming beta release.
          In the meantime, you can join our waitlist to be notified when we go live.
        </p>
        <a
          href="/Waitlist"
          className="inline-block bg-[#c032d1] text-white px-5 py-2 rounded-md font-medium hover:bg-[#b155c9] transition"
        >
          Go to Waitlist
        </a>
      </div>
    </main>
  );
}
