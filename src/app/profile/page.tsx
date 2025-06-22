import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main className="max-w-xl mx-auto p-10">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Your Profile</h1>
      <p className="text-gray-700 text-sm">Email: {user.email}</p>
      <p className="text-gray-700 text-sm">Role: {user.profile?.role}</p>
      {/* Add more profile data here if needed */}
    </main>
  );
}
