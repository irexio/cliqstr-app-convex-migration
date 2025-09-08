// 🔐 APA-HARDENED PAGE: /profile/[username]
// Applies Next.js 15.3+ ghost fix
export const dynamic = 'force-dynamic';

import ProfilePageServerConvex from '@/components/server/ProfilePageServerConvex';

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return <ProfilePageServerConvex username={username} />;
}
