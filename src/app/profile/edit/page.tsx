import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import EditProfilePageClient from './EditProfilePageClient';

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  enforceAPA(user);

  if (!user.myProfile) {
    redirect('/profile/create');
  }

  return <EditProfilePageClient profile={{
    id: user.myProfile.id,
    username: user.myProfile.username,
    firstName: user.myProfile.firstName || null,
    lastName: user.myProfile.lastName || null,
    about: user.myProfile.about || null,
    image: user.myProfile.image || null,
    bannerImage: user.myProfile.bannerImage || null,
    birthdate: user.account?.birthdate ? new Date(user.account.birthdate) : null,
    showYear: user.myProfile.showYear,
  }} />;
}
