'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlanBanner from '@/components/PlanBanner';
import { WaitlistHeader } from '@/components/WaitlistHeader';
import { WaitlistFooter } from '@/components/WaitlistFooter';

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const isWaitlist = pathname.toLowerCase().startsWith('/waitlist');

  if (isWaitlist) {
    return (
      <div className="app-container flex flex-col min-h-screen bg-white text-[#202020]">
        <WaitlistHeader />
        <main className="flex-1 pb-5">{children}</main>
        <div className="bg-[#202020]">
          <WaitlistFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container flex flex-col min-h-screen bg-white text-[#202020]">
      <Header />
      <PlanBanner />
      <main className="flex-1 pb-5">{children}</main>
      <Footer />
    </div>
  );
}
