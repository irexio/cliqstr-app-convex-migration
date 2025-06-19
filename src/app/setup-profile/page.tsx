import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function SetupProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-4">Set Up Your Profile</h1>
      <p className="text-gray-600 text-sm">Welcome, {user.email}! Let’s finish setting up your account.</p>
      {/* Your profile form goes here */}
    </main>
  );
}
