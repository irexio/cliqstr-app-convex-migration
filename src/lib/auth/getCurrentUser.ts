import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from './jwt';

export async function getCurrentUser() {
  const cookieStore = await cookies(); // ✅ Forced async to resolve build error

  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });

  if (!user || !user.profile) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.profile.role,
    isApproved: user.profile.isApproved,
    profile: user.profile,
  };
}
