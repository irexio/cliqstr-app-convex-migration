// 🔐 APA-HARDENED — Create a post in a cliq
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/getServerSession'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  content: z.string().min(1),
  cliqId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    console.log('👤 SESSION:', session)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('📥 BODY:', body)

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      console.log('❌ Invalid input:', parsed.error)
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { content, cliqId } = parsed.data
    console.log('📤 Creating post for cliqId:', cliqId)

    const post = await prisma.post.create({
      data: {
        content,
        cliqId,
        authorId: session.user.id,
      },
    })

    console.log('✅ Post created:', post)
    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    console.error('🔥 Internal server error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
