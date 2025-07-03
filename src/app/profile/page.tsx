// 🔐 APA-HARDENED — Edit Profile Page
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import SetupProfileClient from '@/components/SetUpProfileClient';
import { notFound } from 'next/navigation';

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <SetupProfileClient userId={user.id} isEdit />
    </div>
  );
}
