'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/Button'

interface PostFormProps {
  cliqId: string
}

export default function PostForm({ cliqId }: PostFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)

    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, cliqId }),
      })

      const contentType = res.headers.get('content-type')
      const raw = await res.text()

      console.log('📡 Response content-type:', contentType)
      console.log('📦 Raw response:', raw)

      if (!res.ok) {
        console.error('❌ Post failed:', raw)
        return
      }

      if (contentType?.includes('application/json')) {
        const result = JSON.parse(raw)
        console.log('✅ Post created:', result)
      } else {
        console.warn('⚠️ Unexpected content-type — skipping parse')
      }

      setContent('')
      router.refresh()
    } catch (err) {
      console.error('⚠️ Network or parse error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post..."
        rows={4}
        disabled={loading}
      />
      <div className="text-right">
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  )
}
