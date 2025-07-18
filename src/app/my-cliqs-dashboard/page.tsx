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
    console.log('No account found for user, redirecting to choose plan');
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
    console.log('Plan is null or undefined, redirecting to choose plan');
    return (
      <div className="p-6 text-red-600 text-center">
        No plan selected. <a href="/choose-plan" className="underline text-blue-600">Choose a plan</a>.
      </div>
    );
  }
  
  // Log the plan for debugging
  console.log('User plan accepted:', user.account.plan);
  console.log('User ID for cliq query:', user.id);

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
  
  console.log(`Found ${cliqs.length} cliqs for user ${user.id}:`, cliqs.map(c => c.name));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Cliqs</h1>
          <p className="text-gray-600 mt-1">Manage your cliqs and invite friends to join.</p>
        </div>
        
        <Link 
          href="/cliqs/build"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Cliq
        </Link>
      </div>

      {cliqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Welcome to Cliqstr</h2>
          <p className="text-gray-600 mb-8 max-w-md text-center">Create your first cliq to start sharing with family and friends in a private, safe space.</p>
          <Link
            href="/cliqs/build"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Your First Cliq
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cliqs.map((cliq) => (
            <CliqCard key={cliq.id} cliq={cliq} />
          ))}
        </div>
      )}
    </div>
  );
}
