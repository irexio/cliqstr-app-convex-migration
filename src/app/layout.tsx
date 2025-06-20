// 🔐 APA-HARDENED by Aiden — Do not remove without layout review.
// This is the root layout for Cliqstr — imports Tailwind, font, global rules,
// and safely applies header/footer framing for every route.


import './globals.css'; // Required for font + resets

import { Poppins } from 'next/font/google';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Cliqstr',
  description: 'Private social media for families and kids',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="bg-white text-[#202020] font-poppins antialiased min-h-screen">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
