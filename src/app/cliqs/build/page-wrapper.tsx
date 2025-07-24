import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import BuildCliqClient from './build-cliq-client';

export default async function BuildCliqPage() {
  const user = await getCurrentUser();
  
  if (!user?.id) {
    redirect('/sign-in');
  }
  
  // Check if user has a profile
  if (!user.profile) {
    redirect('/profile/create');
  }
  
  return <BuildCliqClient />;
}