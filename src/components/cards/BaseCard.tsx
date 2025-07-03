'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BaseCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function BaseCard({ children, className, onClick }: BaseCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-gray-200 bg-white shadow hover:shadow-md transition-shadow p-4',
        'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
