'use server';

import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import ProfilePublic from '@/components/ProfilePublic';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { checkSharedCliqMembership } from '@/lib/auth/requireCliqMembership';

export default async function ProfilePageServer({ username }: { username: string }) {
  // Get the current user
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    // Redirect unauthenticated users to sign in
    return redirect('/sign-in');
  }
  
  // Get the target profile
  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!profile || !profile.user?.id) return notFound();
  
  // APA-compliant access control: Check if users share at least one cliq
  // Skip this check if the user is viewing their own profile
  if (profile.user.id !== currentUser.id) {
    try {
      const hasSharedCliq = await checkSharedCliqMembership(currentUser.id, profile.user.id);
      if (!hasSharedCliq) {
        // Users don't share any cliqs, so they shouldn't see each other's profiles
        return notFound();
      }
    } catch (error) {
      console.error('Error checking shared cliq membership:', error);
      return notFound();
    }
  }

  const displayName = !profile?.username || profile.username.startsWith('user-')
    ? profile.user?.email?.split('@')[0] || 'New User'
    : profile.username;

  return (
    <div className="py-10 px-4">
      <ProfilePublic
        displayName={displayName}
        image={profile.image || undefined}
        bannerImage={profile.bannerImage || undefined}
        about={profile.about || undefined}
        birthdate={profile.birthdate.toISOString()}
      />
    </div>
  );
}
