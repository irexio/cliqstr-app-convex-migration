// 🔐 APA-HARDENED SIGN-UP FORM
// Secure account creation with birthdate validation, password strength check,
// and server-determined role + routing. Invite codes supported but optional for adults.
// Client performs light validation — server controls all actual role logic.
// Verified: 2025-06-21 — Part of full APA onboarding flow

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/Button'
import { Label } from '@/components/ui/label'

export default function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('invite') || null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Used for routing only, never sent to backend
  const calculateAge = (dob: string) => {
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    // SECURITY: Basic client validation — server determines truth
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      setLoading(false)
      return
    }

    const parsedDate = new Date(birthdate)
    if (!birthdate || isNaN(parsedDate.getTime())) {
      setError('Please enter a valid birthdate.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    const formattedDate = parsedDate.toISOString().split('T')[0]
    const age = calculateAge(formattedDate) // UI-only

    try {
      // SECURITY: Never send client-calculated age — server decides role and access
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          birthdate: formattedDate,
          inviteCode, // null if not present
        }),
      })

      const data = await res.json()
      console.log('Sign-up response:', { status: res.status, data })

      if (!res.ok) {
        throw new Error(data.error || 'Sign-up failed')
      }

      // SECURITY: Server tells us where to go next
      if (data.requiresApproval) {
        router.push('/parent-approval')
      } else {
        router.push('/choose-plan')
      }
    } catch (err: any) {
      console.error('Sign-up error:', err)
      setError(err.message || 'Something went wrong.')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Create Your Account</h1>

      <Label>Email</Label>
      <Input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <Label className="mt-4">Password</Label>
      <Input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <Label className="mt-4">Birthdate</Label>
      <input
        type="date"
        value={birthdate}
        onChange={e => setBirthdate(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />

      {error && <p className="text-red-500 mt-3">{error}</p>}

      <Button
        onClick={handleSubmit}
        className="mt-6 w-full"
        disabled={loading}
      >
        {loading ? 'Creating Account…' : 'Sign Up'}
      </Button>
    </div>
  )
}
