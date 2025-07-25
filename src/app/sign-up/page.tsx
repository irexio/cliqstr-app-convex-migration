// 🔐 APA-HARDENED SIGN-UP PAGE
// Allows account creation for new users
// Verified: 2025-07-03

'use client'

import { Suspense } from 'react'
import SignUpForm from './sign-up-form'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto space-y-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  )
}
