// 🔐 APA-SAFE — Account settings hub page (private to the logged-in user)
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AccountPage() {
  const user = await getCurrentUser();

  // Only parents and adults can access this page (case-insensitive)
  if (!user?.id || !['parent', 'adult'].includes((user.role ?? '').toLowerCase())) {
    redirect('/');
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      {/* Account Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <span className="text-sm text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Role:</span>
            <span className="text-sm text-gray-900 capitalize">{user.role}</span>
          </div>
          {user.account?.stripeStatus && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Plan:</span>
              <span className="text-sm text-gray-900 capitalize">{user.account.stripeStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Account Management Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email & Password */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Login & Security</h3>
          <div className="space-y-3">
            <Link 
              href="/account/email"
              className="block p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Change Email</div>
              <div className="text-sm text-gray-600">Update your account email address</div>
            </Link>
            <Link 
              href="/account/password"
              className="block p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Change Password</div>
              <div className="text-sm text-gray-600">Update your account password</div>
            </Link>
            <Link 
              href="/account/security"
              className="block p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Security Settings</div>
              <div className="text-sm text-gray-600">Manage sessions and security options</div>
            </Link>
          </div>
        </div>

        {/* Billing & Plans */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing & Plans</h3>
          <div className="space-y-3">
            <Link 
              href="/billing"
              className="block p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Billing & Plans</div>
              <div className="text-sm text-gray-600">Manage your subscription and billing</div>
            </Link>
            <div className="p-3 rounded-md border border-gray-200 bg-gray-50">
              <div className="font-medium text-gray-500">Account Actions</div>
              <div className="text-sm text-gray-500">Suspend or delete account (coming soon)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific sections */}
      {user.role === 'PARENT' && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent Features</h3>
          <Link 
            href="/parent-controls"
            className="block p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Parent Controls</div>
            <div className="text-sm text-gray-600">Manage your children's accounts and permissions</div>
          </Link>
        </div>
      )}
    </main>
  );
}
