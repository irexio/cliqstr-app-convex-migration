import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

type SendResetEmailResponse = {
  success: boolean
  error?: string
  details?: any
  token?: string
  tokenExpires?: Date
}

export async function sendResetEmail(email: string): Promise<SendResetEmailResponse> {
  console.log('📨 [sendResetEmail] Invoked for:', email)

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.log('🚫 No user found:', email)
      return { success: true } // hide whether the user exists
    }

    // ✅ Allow password reset even if not approved
    if (!user.isApproved) {
      console.log(`[🕊️] User not approved — allowing reset so they can complete signup: ${email}`)
    }

    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: tokenExpires,
      },
    })

    const resend = new Resend(process.env.RESEND_API_KEY)
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?code=${token}`

    console.log('🔗 Reset URL:', resetUrl)

    const { data, error } = await resend.emails.send({
      from: 'Cliqstr <noreply@email.cliqstr.com>',
      to: email,
      subject: 'Reset Your Cliqstr Password',
      html: `
        <p>Hi there,</p>
        <p>You requested a password reset for your Cliqstr account.</p>
        <p><a href="${resetUrl}" target="_blank">Click here to reset your password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn’t request this, you can ignore this email.</p>
        <p>– The Cliqstr Team</p>
      `,
    })

    if (error) {
      console.error('❌ Resend error:', error)
      return {
        success: false,
        error: 'Email service failed',
        details: error,
      }
    }

    console.log('✅ Resend response:', data)

    return {
      success: true,
      token,
      tokenExpires,
    }
  } catch (err: any) {
    console.error('❌ sendResetEmail exception:', err)
    return {
      success: false,
      error: err.message || 'Unknown error',
      details: err,
    }
  }
}
