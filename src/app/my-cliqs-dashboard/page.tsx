/**
 * 📂 MyCliqs Dashboard — /my-cliqs-dashboard
 *
 * 🔐 APA-Hardened: Accessible only to logged-in users (child or adult)
 *
 * What this page does:
 * - Displays all cliqs the current user owns or is a member of
 * - Queries both `cliqs` (ownerId) and `memberships` (joined)
 * - Renders a responsive grid of cards (1 mobile • 2 tablet • 3 desktop)
 * - Each card includes:
 *   - Banner image (if uploaded) or fallback gradient
 *   - Cliq name, privacy level, description
 *   - Action buttons: View Cliq • View Members • Invite Someone
 *
 * This page serves as the user's central dashboard and launchpad.
 * It is the starting point for nearly all major actions after login.
 *
 * Used in flows:
 * - Direct sign-up (adult or child)
 * - Post-parent approval (child)
 * - Invited user access
 */

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { isValidPlan } from '@/lib/utils/planUtils';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import CliqCard from '@/components/cliqs/CliqCard';

export const dynamic = 'force-dynamic';

export default async function MyCliqsDashboardPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return <div className="p-6 text-red-600 text-center">Unauthorized</div>;
  }
  
  // Check if account exists first
  if (!user.account) {
    return (
      <div className="p-6 text-red-600 text-center">
        Account setup incomplete. <a href="/choose-plan" className="underline text-blue-600">Choose a plan</a>.
      </div>
    );
  }
  
  // Be extremely permissive with plan validation to avoid redirect loops
  // Only redirect if plan is explicitly null or undefined
  // Accept ANY string value including empty string as valid
  if (user.account.plan === null || user.account.plan === undefined) {
    return (
      <div className="p-6 text-red-600 text-center">
        No plan selected. <a href="/choose-plan" className="underline text-blue-600">Choose a plan</a>.
      </div>
    );
  }
  


  // Query both owned cliqs and memberships
  const cliqs = await prisma.cliq.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { memberships: { some: { userId: user.id } } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      privacy: true,
      createdAt: true,
      ownerId: true,
      coverImage: true,
    },
  });
  


  // Determine user state
  // A user has a profile if they have a profile record AND it has a real username (not the temporary user-xxx format)
  const hasProfile = user.profile && user.profile.username && !user.profile.username.startsWith('user-');
  const hasCliqs = cliqs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* State 1: No Profile - Show welcome only, no header buttons */}
        {!hasProfile ? (
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Welcome to Cliqstr</h1>
            <p className="text-gray-600 mt-1">Create your profile and start connecting with family and friends.</p>
          </div>
        ) : (
          /* State 2 & 3: Has Profile - Show appropriate header with buttons */
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Cliqs</h1>
              <p className="text-gray-600 mt-2">Manage your cliqs and invite friends to join.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href={`/profile/${user.profile?.username}`}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Edit Profile
              </Link>
              
              <Link 
                href="/cliqs/build"
                className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#5558e3] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Create New Cliq
              </Link>
            </div>
          </div>
        )}

      {/* Empty State Content */}
      {!hasCliqs ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          {!hasProfile ? (
            /* State 1: No Profile - Centered Create Profile button */
            <>
              <p className="text-gray-600 mb-8 max-w-md text-center">
                Before you can create or join cliqs, we need you to set up your profile. This helps other members recognize you!
              </p>
              <Link
                href="/profile/create"
                className="flex items-center gap-2 bg-black hover:bg-[#c032d1] text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Create Profile
              </Link>
            </>
          ) : (
            /* State 2: Has Profile, No Cliqs - Centered Create Cliq button */
            <>
              <p className="text-gray-600 mb-8 max-w-md text-center">
                Your profile is all set! Now create your first cliq to start sharing with family and friends in a private, safe space.
              </p>
              <Link
                href="/cliqs/build"
                className="flex items-center gap-2 bg-black hover:bg-[#c032d1] text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Cliq
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cliqs.map((cliq) => (
            <CliqCard key={cliq.id} cliq={cliq} currentUserId={user.id} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
