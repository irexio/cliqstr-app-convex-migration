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
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto space-y-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <SignInForm />
        </Suspense>

        {/* Forgot Password trigger */}
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            type="button"
            className="w-full border border-black text-black py-2 px-4 rounded hover:bg-gray-100 text-sm"
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
