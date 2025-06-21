// 🔐 APA-HARDENED by Aiden — Password Reset Page
// This page handles secure reset token flows via email link.
// No sensitive data is shown. Reset is handled via server-side validation.

'use client'

import { Suspense } from 'react'
import ResetPasswordForm from './reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}

