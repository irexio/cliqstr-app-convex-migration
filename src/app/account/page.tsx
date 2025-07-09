// 🔐 APA-SAFE — Account settings page (private to the logged-in user)
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const user = await getCurrentUser();

  // Only parents and adults can access this page (case-insensitive)
  if (!user?.id || !['parent', 'adult'].includes((user.role ?? '').toLowerCase())) {
    redirect('/');
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      <div className="space-y-4 text-sm text-gray-800 bg-white p-6 rounded shadow">
        <div>
          <span className="font-medium text-gray-600">Email:</span>
          <span className="ml-2">{user.email}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Role:</span>
          <span className="ml-2 capitalize">{user.role}</span>
        </div>


        {user.account?.stripeStatus && (
          <div>
            <span className="font-medium text-gray-600">Subscription Plan:</span>
            <span className="ml-2 capitalize">{user.account.stripeStatus}</span>
          </div>
        )}

        {/* Future optional: subscription management */}
        {/*
        <div className="pt-4">
          <button className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800">
            Manage Subscription
          </button>
        </div>
        */}
      </div>
    </main>
  );
}
