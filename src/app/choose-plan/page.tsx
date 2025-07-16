import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import ChoosePlanForm from './choose-plan-form';

export const dynamic = 'force-dynamic';

export default async function ChoosePlanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // ✅ Debug: Log user and plan
  console.log('[APA] Reached /choose-plan');
  console.log('User:', user?.email);
  console.log('Plan:', user?.plan);
  console.log('Approved:', user?.approved);
  console.log('Account approved:', user?.account?.isApproved);
  
  // If user is already approved, redirect them to the dashboard
  if (user.approved === true || user.account?.isApproved === true) {
    console.log('[APA] User is already approved. Redirecting to dashboard.');
    redirect('/my-cliqs-dashboard');
  }
  
  // If user already has a test plan, redirect them to the dashboard
  if (user.plan === 'test') {
    console.log('[APA] User already has test plan. Redirecting to dashboard.');
    redirect('/my-cliqs-dashboard');
  }

  // Allow both Parents and Adults to select plans per APA guidelines
  if (user.account?.role !== 'Parent' && user.account?.role !== 'Adult') {
    return (
      <div className="p-10 text-red-600 text-center">
        Access denied. Only parents and adults can select a plan.
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#202020] mb-2 font-poppins">Choose Your Plan</h1>
        <p className="text-gray-600 max-w-md mx-auto">Select the plan that best fits your needs. You can change or upgrade your plan anytime.</p>
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg py-3 px-5 inline-block mx-auto">
          <p className="font-medium text-gray-800 flex items-center">
            <span className="mr-2">✨</span> All paid memberships include a <span className="font-bold mx-1">free 30-day trial</span>
          </p>
        </div>
      </div>
      <ChoosePlanForm />
    </main>
  );
}
