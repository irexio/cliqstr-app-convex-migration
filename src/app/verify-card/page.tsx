import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function VerifyCardPage() {
  const user = await getCurrentUser();

  if (!user || user.profile?.role !== 'parent') {
    redirect('/sign-in');
  }

  return (
    <main className="max-w-xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">Verify Your Card</h1>
      <p className="text-gray-700 text-sm">
        For security, please confirm your card to approve your child’s access.
      </p>
      {/* Stripe checkout component will go here */}
    </main>
  );
}
