import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import BuildCliqClient from './build-cliq-client';

export default async function BuildCliqPage() {
  const user = await getCurrentUser();
  
  if (!user?.id) {
    redirect('/sign-in');
  }
  
  // Profile is optional for cliq creation - users can create cliqs without profiles
  // They'll use default avatars and can complete their profile later
  
  return <BuildCliqClient />;
}