'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface AppWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function AppWrapper({ children, className = '' }: AppWrapperProps) {
  const pathname = usePathname();
  
  // Check if we're on an info page
  const isInfoPage = [
    '/about',
    '/safety',
    '/faqs',
    '/how-it-works',
    '/for-parents'
  ].includes(pathname);
  
  return (
    <div className={`app-container flex flex-col ${isInfoPage ? 'bg-black' : 'bg-white'} ${className}`}>
      {children}
    </div>
  );
}