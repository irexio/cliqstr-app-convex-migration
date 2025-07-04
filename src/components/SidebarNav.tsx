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
              'bg-black text-white hover:bg-black/90',
              isActive && 'bg-black shadow-sm'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                isActive ? 'text-[#c032d1]' : 'text-white hover:text-[#c032d1]'
              )}
            />
            <span className={cn(
              'transition-colors',
              isActive ? 'text-[#c032d1] font-semibold' : 'text-white hover:text-[#c032d1]'
            )}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}