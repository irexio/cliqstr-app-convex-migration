import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import ClientView from './_client';

export default async function MyCliqsDashboardPage() {
  const user = await getCurrentUser();
  enforceAPA(user);
  return <ClientView user={user} />;
}