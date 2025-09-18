// 🔐 APA-SAFE — Account settings hub page (private to the logged-in user)
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import AccountClient from './_client';

export default async function AccountPage() {
  const user = await getCurrentUser();
  enforceAPA(user);
  return <AccountClient user={user} />;
}
