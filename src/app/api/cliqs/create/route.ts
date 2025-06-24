// 🔐 APA-HARDENED — Create cliq in DB with real session
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth/getServerSession'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  privacy: z.enum(['private', 'public', 'semi-private']),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return new NextResponse('Invalid input', { status: 400 })
    }

    const { name, description, privacy } = parsed.data

    const newCliq = await prisma.cliq.create({
      data: {
        name,
        description: description || '',
        privacy,
        ownerId: session.user.id,
      },
    })

    // ✅ Add owner as a member (so it appears in /my-cliqs)
    await prisma.membership.create({
      data: {
        userId: session.user.id,
        cliqId: newCliq.id,
        role: 'Owner',
      },
    })

    return NextResponse.json({ cliq: newCliq })
  } catch (error) {
    console.error('❌ Error creating cliq:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
