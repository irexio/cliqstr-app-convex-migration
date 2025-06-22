import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function VerifyCardPage() {
  const user = await getCurrentUser();

  if (!user || user.profile?.role !== 'parent') {
    redirect('/sign-in');
  }

  return (
    <main className="max-w-xl mx-auto p-10">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Verify Your Card</h1>
      <p className="text-gray-700 text-sm">
        For security, please confirm your card to approve your child’s access.
      </p>
      {/* Stripe checkout component will go here */}
    </main>
  );
}
