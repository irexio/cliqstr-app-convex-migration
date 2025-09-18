import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import SecurityClient from './_client';

export default async function SecurityPage() {
  const user = await getCurrentUser();
  enforceAPA(user);
  return <SecurityClient userEmail={user.email} />;
}
