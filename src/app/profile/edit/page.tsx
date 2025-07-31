import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import EditProfilePageClient from './EditProfilePageClient';

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  if (!user.myProfile) {
    redirect('/profile/create');
  }

  return <EditProfilePageClient profile={user.myProfile} />;
}
