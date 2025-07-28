import React from 'react';
import { InfoSidebar } from './InfoSidebar';
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface InfoPageLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  title?: string;
}

export function InfoPageLayout({ children, breadcrumbs = [], title }: InfoPageLayoutProps) {
  return (
    <div className="flex-1 min-h-screen">
      {/* Main Content Layout */}
      <div className="flex gap-4 p-4 min-h-[calc(100vh-200px)] max-w-[1200px] mx-auto">
        <InfoSidebar />
        
        {/* Content Area - white background, 12px border radius, no shadows */}
        <main className="flex-1 bg-white rounded-xl p-6 md:p-8 lg:p-12">
          {/* Page Title - centered */}
          {title && (
            <h1 className="text-3xl md:text-4xl font-bold text-[#202020] mb-6 text-center">
              {title}
            </h1>
          )}

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}