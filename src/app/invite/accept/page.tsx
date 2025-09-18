import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import InviteAcceptClient from './_client';

export default async function InviteAcceptPage() {
  const user = await getCurrentUser();
  enforceAPA(user);
  return <InviteAcceptClient />;
}
