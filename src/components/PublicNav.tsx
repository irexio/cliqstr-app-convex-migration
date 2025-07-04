'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bars3Icon, TicketIcon } from '@heroicons/react/24/outline'
import InviteCodeModal from './InviteCodeModal'

export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  return (
    <header className="w-full border-b bg-background px-4 py-3 shadow-sm font-sans">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Logo */}        <Link href="/" className="text-xl font-bold text-[#202020] font-poppins">
          cliqstr
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/explore" className="text-sm hover:text-accent transition-colors">
            Explore Public Cliqs
          </Link>
          <Link href="/how-it-works" className="text-sm hover:text-accent transition-colors">
            How it Works
          </Link>
          <Link href="/about" className="text-sm hover:text-accent transition-colors">
            About
          </Link>
          <Link href="/faqs" className="text-sm hover:text-accent transition-colors">
            FAQs
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher styled as black dropdown */}
          <select
            className="bg-black text-white hover:bg-gray-800 font-semibold px-4 py-2 rounded-xl text-sm"
            defaultValue="default"
            onChange={(e) => {
              const selected = e.target.value
              document.documentElement.setAttribute('data-theme', selected)
              localStorage.setItem('theme', selected)
            }}
          >
            <option value="default">Default</option>
            <option value="softwhimsy">Softwhimsy</option>
            <option value="storybook">Storybook</option>
            <option value="campfire">Campfire</option>
            <option value="scandi">Scandi</option>
          </select>

          {/* Auth Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center bg-gradient-to-r from-purple-100 to-gray-100 text-black border border-purple-200 hover:border-[#c032d1] px-3 py-2 rounded-full shadow-sm transition-all hover:shadow"
            >
              <TicketIcon className="h-4 w-4 mr-1 text-[#c032d1]" />
              <span>Join with <span className="font-bold">Invite</span></span>
            </button>
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-gray-700 hover:text-black px-4 py-2 rounded-xl"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="bg-black text-white hover:bg-gray-800 font-semibold px-4 py-2 rounded-xl text-sm"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-2 text-[#202020]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 px-4 space-y-2 pb-4">
          <Link href="/explore" className="block text-sm hover:text-accent">
            Explore Public Cliqs
          </Link>
          <Link href="/how-it-works" className="block text-sm hover:text-accent">
            How it Works
          </Link>
          <Link href="/about" className="block text-sm hover:text-accent">
            About
          </Link>
          <Link href="/faqs" className="block text-sm hover:text-accent">
            FAQs
          </Link>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center text-sm bg-gradient-to-r from-purple-100 to-gray-100 text-black border border-purple-200 hover:border-[#c032d1] px-3 py-2 rounded-full shadow-sm w-full my-2 justify-center"
          >
            <TicketIcon className="h-4 w-4 mr-1 text-[#c032d1]" />
            <span>Join with <span className="font-bold">Invite</span></span>
          </button>
          <Link href="/sign-in" className="block text-sm hover:text-accent">
            Sign in
          </Link>
          <Link href="/sign-up" className="block text-sm hover:text-accent">
            Sign up
          </Link>
        </div>
      )}

      {/* Invite Code Modal */}
      <InviteCodeModal open={inviteModalOpen} setOpen={setInviteModalOpen} />
    </header>
  )
}
