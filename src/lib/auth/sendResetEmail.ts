/**
 * 🔐 APA-SAFE UTILITY: sendResetEmail (v2)
 *
 * Purpose:
 *   - Handles secure password reset flow:
 *     1. Validates email
 *     2. Creates + stores hashed token
 *     3. Sends reset email via Resend
 */

import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

type SendResetEmailResponse = {
  success: boolean
  error?: string
  details?: any
  data?: any
  token?: string
  tokenExpires?: Date
  hashedToken?: string
}

export async function sendResetEmail(
  email: string,
  generateNewToken = true,
  existingToken?: string
): Promise<SendResetEmailResponse> {
  console.log('📨 [sendResetEmail] Invoked')
  console.log('📧 Email:', email)

  const apiKey = process.env.RESEND_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cliqstr.com'

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY missing')
    return {
      success: false,
      error: 'Email service configuration error',
    }
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    // Don't reveal account existence for security
    if (!user) {
      console.log(`[🔒] No account found for ${email} — exiting silently.`)
      return { success: true }
    }

    let token: string
    let hashedToken: string
    let tokenExpires: Date

    if (generateNewToken) {
      token = crypto.randomBytes(32).toString('hex')
      hashedToken = crypto.createHash('sha256').update(token).digest('hex')
      tokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpires: tokenExpires,
        },
      })
    } else if (existingToken) {
      token = existingToken
      hashedToken = crypto.createHash('sha256').update(token).digest('hex')
      tokenExpires = user.resetTokenExpires || new Date(Date.now() + 60 * 60 * 1000)
    } else {
      return {
        success: false,
        error: 'No token provided or generated',
      }
    }

    const resend = new Resend(apiKey)
    const resetUrl = `${baseUrl}/reset-password?code=${token}`

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔗 Reset link for ${email}: ${resetUrl}`)
    }

    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your Cliqstr Password',
      html: `
        <p>Hi there,</p>
        <p>Someone (hopefully you!) requested a password reset for your Cliqstr account.</p>
        <p><a href="${resetUrl}" target="_blank">Reset your password</a></p>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn’t request this, you can safely ignore it.</p>
        <p>– The Cliqstr Team</p>
      `,
    })

    if (error) {
      console.error('❌ Failed to send email via Resend:', error)
      return {
        success: false,
        error: 'Email service failed',
        details: error,
      }
    }

    console.log('[✅] Password reset email sent to:', email)

    return {
      success: true,
      data,
      token,
      tokenExpires,
      hashedToken,
    }
  } catch (err: any) {
    console.error('❌ sendResetEmail() error:', err)
    return {
      success: false,
      error: err.message || 'Unknown error',
      details: {
        code: err.code,
        status: err.statusCode,
        context: 'Reset email handler',
      },
    }
  }
}
