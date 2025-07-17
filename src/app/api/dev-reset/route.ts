import { sendResetEmail } from '@/lib/auth/sendResetEmail'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email') || ''

  if (!email) {
    return new Response('❌ Missing ?email= param', { status: 400 })
  }

  const result = await sendResetEmail(email)
  console.log('🧪 [DEV RESET RESULT]:', result)

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  })
}
