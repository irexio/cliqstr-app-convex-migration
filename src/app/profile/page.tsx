// 🔐 APA-HARDENED — Profile Redirect Page
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function ProfileRedirectPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/sign-in');
  }

  // Redirect to the user's own profile if they have one
  if (user.profile && !user.profile.username?.startsWith('user-')) {
    redirect(`/profile/${user.profile.username}`);
  } else {
    // If no profile, redirect to create one
    redirect('/profile/create');
  }
}
