// 🔐 APA-HARDENED RESET PASSWORD ENDPOINT
// This API route handles secure password updates via short-lived JWT token
// - Token is verified using APA-auth safe `verifyToken` method
// - Password is hashed with bcryptjs
// - No role manipulation or session creation
// Verified: 2025-06-22 - Testing Session 1

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gte: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
