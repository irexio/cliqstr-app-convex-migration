export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export default async function SessionCheckPage() {
  const user = await getCurrentUser();

  console.log('[DEBUG] Session Check:', {
    email: user?.email,
    role: user?.role,
    plan: user?.plan,
    approved: user?.approved,
  });

  if (!user) {
    return (
      <div className="p-10 text-center text-red-600">
        <h1>No session found</h1>
        <p>You are not signed in or session has expired.</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-xl mx-auto space-y-4 text-center">
      <h1 className="text-2xl font-bold">🔍 Session Check</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Plan:</strong> {user.plan ?? 'None (⚠️)'}</p>
      <p><strong>Approved:</strong> {user.approved ? '✅ Yes' : '❌ No'}</p>
    </div>
  );
}
