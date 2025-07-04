// 🔐 APA-HARDENED SIGN-UP PAGE
// Allows account creation for new users
// Verified: 2025-07-03

'use client'

import { Suspense } from 'react'
import SignUpForm from './sign-up-form'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-4 px-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  )
}
