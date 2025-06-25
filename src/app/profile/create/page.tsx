'use client'

import SetUpProfileClient from '@/components/SetUpProfileClient'

export default function CreateProfilePage() {
  // 🔐 APA: session must be passed from server or handled elsewhere
  // You can also pre-check this route with middleware if needed

  // Temporarily hardcoding or simulating a session check
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;

  if (!userId) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <SetUpProfileClient userId={userId} />
    </div>
  )
}
