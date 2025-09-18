// 🔐 APA-HARDENED PAGE: /profile/[username]
// Applies Next.js 15.3+ ghost fix
export const dynamic = 'force-dynamic';

import ProfilePageServerConvex from '@/components/server/ProfilePageServerConvex';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const user = await getCurrentUser();
  enforceAPA(user);
  const { username } = await params;

  return <ProfilePageServerConvex username={username} />;
}
