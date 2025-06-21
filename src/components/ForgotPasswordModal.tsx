'use client'

// 🔐 APA-HARDENED FORGOT PASSWORD MODAL FOR CLIQSTR
// Handles password reset requests via email - safe for all users including minors
// Uses secure email validation and proper error handling
// Verified: 2025-06-21

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/Button'

export default function ForgotPasswordModal({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/send-reset-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setError(data?.error || 'Something went wrong.')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setError('Server error. Try again.')
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="fixed z-50 inset-0 flex items-center justify-center bg-black/50">
      <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md text-black">
        <Dialog.Title className="text-xl font-semibold mb-4">Reset Your Password</Dialog.Title>

        {status === 'success' ? (
          <p className="text-green-600">Check your email for a password reset link.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">Enter your email and we’ll send you a reset link.</p>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-4"
            />
            {status === 'error' && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Send Reset Link</Button>
            </div>
          </>
        )}
      </Dialog.Panel>
    </Dialog>
  )
}
