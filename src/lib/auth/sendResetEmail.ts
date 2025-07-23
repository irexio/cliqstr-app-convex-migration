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
    const user = await prisma.user.findUnique({ where: { email }, include: { account: true } })

    if (!user) {
      console.log('🚫 No user found:', email)
      return { success: true } // hide whether the user exists
    }

    // ✅ Allow password reset even if not approved
    if (!user.account?.isApproved) {
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

    // Log environment variables (without exposing full API key)
    const apiKey = process.env.RESEND_API_KEY
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cliqstr.com'
    
    console.log('🔑 RESEND_API_KEY exists:', !!apiKey)
    console.log('🌐 NEXT_PUBLIC_SITE_URL:', baseUrl)
    
    const resend = new Resend(apiKey)
    const resetUrl = `${baseUrl}/reset-password?code=${token}`

    console.log('🔗 Reset URL:', resetUrl)

    const { data, error } = await resend.emails.send({
      from: 'Cliqstr <noreply@email.cliqstr.com>',
      to: email,
      subject: 'Reset Your Cliqstr Password',
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hi there,</p>
          <p>You requested a password reset for your Cliqstr account.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background:#000000; color:white; border-radius:5px; text-decoration:none; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">This link will expire in 1 hour.</p>
          <p style="font-size: 12px; color: #888;">If you didn't request this, you can ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #888;">– The Cliqstr Team</p>
        </div>
      `,
    })

    if (error) {
      console.error('❌ Resend error:', error)
      console.error('📧 Email details - From:', 'Cliqstr <noreply@email.cliqstr.com>')
      console.error('📧 Email details - To:', email)
      console.error('📧 Email details - Subject:', 'Reset Your Cliqstr Password')
      
      return {
        success: false,
        error: 'Email service failed: ' + (error.message || JSON.stringify(error)),
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
