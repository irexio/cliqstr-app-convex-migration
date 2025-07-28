'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import {
  InformationCircleIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const navLinks = [
  { href: '/about', label: 'About', icon: InformationCircleIcon },
  { href: '/safety', label: 'Safety', icon: ShieldCheckIcon },
  { href: '/faqs', label: 'FAQs', icon: QuestionMarkCircleIcon },
  { href: '/how-it-works', label: 'How It Works', icon: BookOpenIcon },
  { href: '/for-parents', label: 'For Parents', icon: UserGroupIcon },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-black rounded-lg p-4 h-fit">
      <div className="space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200',
                'hover:bg-gray-800',
                isActive && 'bg-gray-800'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-[#c032d1]' : 'text-white'
                )}
              />
              <span
                className={cn(
                  'text-sm',
                  isActive ? 'text-[#c032d1] font-semibold' : 'text-white'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
