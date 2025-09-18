import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import ClientView from './build-cliq-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  enforceAPA(user);
  return <ClientView />;
}