// src/app/parent-approval/page.tsx

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import ParentApprovalPage from '@/components/ParentApprovalPage';

export default async function ParentApprovalWrapper() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.profile?.role !== 'parent') {
    return (
      <div className="p-10 text-red-600 text-center">
        Access denied. Only parents can approve accounts.
      </div>
    );
  }

  return <ParentApprovalPage parentId={user.id} />;
}
