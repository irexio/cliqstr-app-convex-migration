// 🔐 APA-HARDENED — Safe server-side session wrapper
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function getServerSession() {
  const user = await getCurrentUser()
  if (!user) return null
  return { user }
}
