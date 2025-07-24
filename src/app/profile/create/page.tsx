// 🔐 APA-HARDENED — Secure Create Profile Page
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import CreateProfileForm from '@/components/CreateProfileForm';
import { redirect } from 'next/navigation';

export default async function CreateProfilePage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/sign-in');
  }
  
  // If user already has a complete profile (not a temporary one), redirect to dashboard
  if (user.profile && !user.profile.username?.startsWith('user-')) {
    redirect('/my-cliqs-dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CreateProfileForm />
    </div>
  );
}
