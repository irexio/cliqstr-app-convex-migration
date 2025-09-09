// 🔐 APA-HARDENED — User Feed Page
export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED PAGE: /cliqs/feed
 *
 * Purpose:
 *   - Renders the logged-in user’s cliq feed
 *   - Displays posts that already include author information
 *
 * Auth:
 *   - Requires a valid user session
 *   - Redirects to 404 if unauthenticated
 *
 * Notes:
 *   - Does NOT pass userId to CliqFeed (posts contain their own author info)
 *   - Dynamic rendering prevents static caching
 */

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { notFound } from 'next/navigation';
import CliqFeedConvex from '@/components/cliqs/CliqFeedConvex';

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    notFound();
  }

  // Use the user's ID as the default cliqId
  // In a production app, you might want to fetch the user's preferred cliq
  const defaultCliqId = user.id;
  
  return (
    <main className="min-h-screen p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-[#202020] font-poppins">
          Your Cliq Feed
        </h1>
        <CliqFeedConvex cliqId={defaultCliqId} />
      </div>
    </main>
  );
}
