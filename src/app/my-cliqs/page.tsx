import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import MyCliqsPage from '@/components/MyCliqsPage';

export default async function MyCliqsPageWrapper() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.profile?.role === 'child' && user.profile?.isApproved !== true) {
    redirect('/awaiting-approval');
  }

  return <MyCliqsPage userId={user.id} />;
}
