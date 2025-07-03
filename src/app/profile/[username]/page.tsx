// 🔐 APA-HARDENED PAGE: /profile/[username]
// Applies Next.js 15.3+ ghost fix

import ProfilePageServer from '@/components/server/ProfilePageServer';

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return <ProfilePageServer username={username} />;
}
