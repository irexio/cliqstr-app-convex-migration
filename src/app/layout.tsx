// 🔐 APA-HARDENED by Aiden — Do not remove without layout review.
// This is the root layout for Cliqstr — imports Tailwind, font, global rules,
// and safely applies header/footer framing for every route.


import './globals.css'; // Required for font + resets
import '@uploadthing/react/styles.css';

import { Poppins } from 'next/font/google';
import type { Metadata } from 'next';
// Import from the wrapper which should handle the re-export
// Version: 2024.1.27.1
import SessionProvider from '@/components/SessionProvider';
import AppFrame from '@/components/AppFrame';


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
      <body className="text-[#202020] font-poppins antialiased">
        <SessionProvider>
          <AppFrame>{children}</AppFrame>
        </SessionProvider>
      </body>
    </html>
  );
}
