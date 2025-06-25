// 🔐 APA-HARDENED SIGN-IN PAGE
// Secure sign-in page with Forgot Password modal support and suspense fallback
// Verified: 2025-06-21 — Passed audit, triggers reset flow safely via modal

'use client'

import { Suspense, useState } from 'react'
import SignInForm from './sign-in-form'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'
import { Button } from '@/components/Button'

export default function SignInPage() {
  const [forgotOpen, setForgotOpen] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-4 px-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <SignInForm />
        </Suspense>

        {/* Forgot Password trigger */}
        <div className="flex justify-end pt-1">
          <Button
            variant="outline"
            type="button"
            className="text-sm text-gray-500 hover:text-[#c032d1]"
            onClick={() => setForgotOpen(true)}
          >
            Forgot your password?
          </Button>
        </div>

        {/* Modal */}
        <ForgotPasswordModal open={forgotOpen} setOpen={setForgotOpen} />
      </div>
    </div>
  )
}
