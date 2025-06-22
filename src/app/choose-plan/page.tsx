// src/app/choose-plan/page.tsx

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import ChoosePlanForm from './choose-plan-form';

export default async function ChoosePlanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.profile?.role !== 'parent') {
    return (
      <div className="p-10 text-red-600 text-center">
        Access denied. Only parents can select a plan.
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-10">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Choose Your Plan</h1>
      <ChoosePlanForm />
    </main>
  );
}
