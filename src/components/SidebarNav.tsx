'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

import {
  InformationCircleIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline'

const navLinks = [
  { href: '/about', label: 'About', icon: InformationCircleIcon },
  { href: '/safety', label: 'Safety', icon: ShieldCheckIcon },
  { href: '/faqs', label: 'FAQs', icon: QuestionMarkCircleIcon },
  { href: '/how-it-works', label: 'How It Works', icon: BookOpenIcon },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2 text-sm font-medium">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              'bg-[#F4F4F5]',
              isActive
                ? 'bg-accent/10'
                : 'hover:bg-white'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                'text-accent'
              )}
            />
            <span className="text-[#040316]">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}