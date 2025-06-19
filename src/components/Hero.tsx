'use client';

import Link from 'next/link';

export function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-[#2a2356] via-[#5f3dc4] to-[#8148bb] text-white min-h-[500px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 text-center w-full">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight font-poppins">
          Social Media With<br />
          <span className="text-[#c5bfff] font-semibold">Privacy</span> at Its Core
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg font-normal font-poppins text-white/90">
          No stalkers. No hawkers. Just your cliqs. Connect privately with the people who matter most to you, without the noise.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap font-poppins">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-6 py-3 border border-white text-white text-sm font-semibold rounded-md hover:bg-white/10 transition min-w-[180px]"
          >
            Sign Up Now
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#202020] text-sm font-semibold rounded-md hover:bg-white/90 transition min-w-[180px]"
          >
            Learn About Cliqs
          </Link>
        </div>
      </div>
    </section>
  );
}
