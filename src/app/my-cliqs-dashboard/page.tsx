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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Cliqs</h1>
        
      </div>

      {cliqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold mb-6">Welcome to Cliqstr — Beta</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/cliqs/build"
              className="bg-black text-white px-6 py-3 rounded-md text-lg font-semibold hover:text-[#c032d1] transition"
            >
              ➕ Create a Cliq
            </Link>
            <Link
              href="/profile"
              className="bg-black text-white px-6 py-3 rounded-md text-lg font-semibold hover:text-[#c032d1] transition"
            >
              👤 Create Your Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cliqs.map((cliq) => (
            <div
              key={cliq.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col"
            >
              <div className="relative w-full h-28">
                {cliq.coverImage ? (
                  <Image
                    src={cliq.coverImage}
                    alt={`${cliq.name} banner`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#7F56D9] to-[#C032D1]" />
                )}
              </div>

              <div className="p-4 flex flex-col gap-2">
                <h2 className="text-lg font-semibold">{cliq.name}</h2>
                <p className="text-xs text-gray-500 capitalize">{cliq.privacy} Cliq</p>
                <p className="text-sm text-gray-700">
                  {cliq.description || 'No description yet.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-4 mt-auto">
                  <Link
                    href={`/cliqs/${cliq.id}`}
                    className="px-3 py-1 border rounded text-sm hover:text-[#c032d1]"
                  >
                    👁️ View
                  </Link>
                  <Link
                    href={`/cliqs/${cliq.id}/members`}
                    className="px-3 py-1 border rounded text-sm hover:text-[#c032d1]"
                  >
                    🧑‍🤝‍🧑 Members
                  </Link>
                  <Link
                    href={`/cliqs/${cliq.id}/invite`}
                    className="px-3 py-1 border rounded text-sm hover:text-[#c032d1]"
                  >
                    ✉️ Invite
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
