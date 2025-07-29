'use server';

import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import ProfileClientWrapper from '@/app/profile/[username]/ProfileClient';
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
  const profile = await prisma.myProfile.findUnique({
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

  if (!profile) return notFound();
  
  // APA-compliant access control: Check if users share at least one cliq
  // Skip this check if the user is viewing their own profile
  if (profile.userId !== currentUser.id) {
    try {
      const hasSharedCliq = await checkSharedCliqMembership(currentUser.id, profile.userId);
      if (!hasSharedCliq) {
        // Users don't share any cliqs, so they shouldn't see each other's profiles
        return notFound();
      }
    } catch (error) {
      console.error('Error checking shared cliq membership:', error);
      return notFound();
    }
  }

  const isOwner = profile.userId === currentUser.id;
  
  // Fetch scrapbook items (only valid ones - not expired unless pinned)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const scrapbookItems = await prisma.scrapbookItem.findMany({
    where: {
      profileId: profile.id,
      OR: [
        { isPinned: true },
        { createdAt: { gte: ninetyDaysAgo } },
      ],
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  const profileData = {
    id: profile.id,
    name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username,
    username: profile.username,
    birthdate: profile.birthdate.toISOString(),
    bio: profile.about || '',
    avatarUrl: profile.image || undefined,
    bannerUrl: profile.bannerImage || undefined,
    isOwner,
    canViewGallery: true, // Since they share a cliq, they can view the gallery
    showYear: profile.showYear || false,
    galleryLayoutStyle: 'inline' as const,
    // Include Account data for age verification (optional for backward compatibility)
    accountBirthdate: undefined, // Will be populated when Account.birthdate is set during signup
    accountRole: undefined,
  };

  return (
    <ProfileClientWrapper
      initialProfile={profileData}
      initialScrapbookItems={scrapbookItems}
    />
  );
}
