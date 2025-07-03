// 🔐 APA-HARDENED — Secure Create Profile Page
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import SetupProfileClient from '@/components/SetupProfileClient';
import { notFound } from 'next/navigation';

export default async function CreateProfilePage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    notFound(); // or redirect to sign-in
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <SetupProfileClient userId={user.id} />
    </div>
  );
}
