import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function SetupProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Set Up Your Profile</h1>
      <p className="text-gray-600 text-sm">Welcome, {user.email}! Let’s finish setting up your account.</p>
      {/* Your profile form goes here */}
    </main>
  );
}
