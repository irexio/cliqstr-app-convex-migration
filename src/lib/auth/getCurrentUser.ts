import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from './jwt';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);

  if (!payload?.userId) return null;

  // The JWT token contains the User ID, so we need to find the user directly
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      profile: true, // Add this to include the profile relation
    },
  });

  return user;
}
