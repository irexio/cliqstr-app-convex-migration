// 🔐 APA-HARDENED SIGN-UP PAGE
// Allows account creation for new users and gracefully supports reset flow via modal
// Modal triggers forgot password form without route change
// Verified: 2025-06-21

'use client'

import { Suspense, useState } from 'react'
import SignUpForm from './sign-up-form'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'
import { Button } from '@/components/Button'

export default function SignUpPage() {
  const [forgotOpen, setForgotOpen] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-4 px-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <SignUpForm />
        </Suspense>

{/* Forgot Password trigger */}
<div className="flex justify-end pt-1">
  <Button
    type="button"
    className="text-sm text-gray-500 hover:text-[#c032d1] hover:bg-transparent"
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
