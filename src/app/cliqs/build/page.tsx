// 🔐 APA-HARDENED — Cliq creation page
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/Button'
import { Label } from '@/components/ui/label'

export default function BuildCliqPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'private' | 'semi' | 'public'>('private')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/cliqs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, privacy }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push(`/cliqs/${data.cliq.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create a New Cliq</h1>
      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <Label>Cliq Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <Label>Privacy</Label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as any)}
            className="w-full p-2 border rounded-md"
          >
            <option value="private">Private</option>
            <option value="semi">Semi-Private</option>
            <option value="public">Public</option>
          </select>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Cliq'}
        </Button>
      </form>
    </div>
  )
}
