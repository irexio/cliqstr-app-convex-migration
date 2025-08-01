import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import ChoosePlanForm from './choose-plan-form';

export const dynamic = 'force-dynamic';

export default async function ChoosePlanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // User verification is handled during sign-up flow
  // No need to check isVerified here

  // ✅ Debug: Log user and plan
  console.log('[APA] Reached /choose-plan');
  console.log('User:', user?.email);
  console.log('Plan:', user?.plan);
  console.log('Approved:', user?.approved);
  console.log('Account approved:', user?.account?.isApproved);
  console.log('Full user object:', JSON.stringify(user, null, 2));
  
  // Ensure we have a valid user object with necessary properties
  if (!user) {
    console.error('[APA] User object is null or undefined');
    redirect('/sign-in');
  }
  
  // If user is already approved AND has a plan, redirect them to the dashboard
  if ((user.approved === true || user.account?.isApproved === true) && 
      (user.plan === 'test' || user.account?.plan === 'test')) {
    console.log('[APA] User is already approved and has a plan. Redirecting to dashboard.');
    redirect('/my-cliqs-dashboard');
  }
  
  // Don't redirect if they need to select a plan
  console.log('[APA] User needs to select a plan or complete setup');
  console.log('[APA] User plan:', user.plan);
  console.log('[APA] Account plan:', user.account?.plan);

  // Debug logging for role checking
  console.log('[APA] User role (user.role):', user.role);
  console.log('[APA] Account role (user.account?.role):', user.account?.role);
  console.log('[APA] User object keys:', Object.keys(user));
  if (user.account) {
    console.log('[APA] Account object keys:', Object.keys(user.account));
  }

  // 🛠️ SOL'S FIX: Check for invite role in session/localStorage
  let inviteRole: string | null = null;
  let inviteCode: string | null = null;
  
  // Check sessionStorage for invite context (set by adult invite page)
  if (typeof window !== 'undefined') {
    try {
      const adultInviteContext = sessionStorage.getItem('adultInviteContext');
      if (adultInviteContext) {
        const context = JSON.parse(adultInviteContext);
        inviteCode = context.inviteCode;
        inviteRole = 'adult'; // Adult invite page sets this
        console.log('[APA] Found adult invite context:', context);
      }
      
      // Also check for any stored invite role
      const storedInviteRole = sessionStorage.getItem('inviteRole') || localStorage.getItem('inviteRole');
      if (storedInviteRole) {
        inviteRole = storedInviteRole;
        console.log('[APA] Found stored invite role:', storedInviteRole);
      }
    } catch (error) {
      console.error('[APA] Error reading invite context:', error);
    }
  }

  // 🛠️ SOL'S FIX: Honor invite role for plan access
  const userRole = (user.role || '').toLowerCase();
  const accountRole = (user.account?.role || '').toLowerCase();
  const inviteRoleLower = (inviteRole || '').toLowerCase();
  
  console.log('[APA] Role check - User:', userRole, 'Account:', accountRole, 'Invite:', inviteRoleLower);
  
  // Allow access if:
  // 1. User has parent/adult role
  // 2. OR they were invited as adult/parent
  // 3. OR fallback for old cliqs (no strict blocking)
  const hasValidRole = 
    userRole === 'parent' || userRole === 'adult' ||
    accountRole === 'parent' || accountRole === 'adult' ||
    inviteRoleLower === 'parent' || inviteRoleLower === 'adult';
  
  if (!hasValidRole) {
    console.log('[APA] Access denied - no valid role found');
    return (
      <div className="p-10 text-center">
        <div className="text-red-600 mb-4">
          Access denied. Only parents and adults can select a plan.
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Debug: User role: {userRole || 'none'}, Account role: {accountRole || 'none'}, Invite role: {inviteRoleLower || 'none'}
        </div>
        {inviteCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm mb-2">
              💡 <strong>Were you invited?</strong>
            </p>
            <p className="text-blue-700 text-sm mb-3">
              If you were invited, please re-click your invite link or try again.
            </p>
            <button 
              onClick={() => window.location.href = `/invite/accept?code=${inviteCode}`}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Re-process Invite
            </button>
          </div>
        )}
        <div className="text-xs text-gray-500">
          If you continue to have issues, please contact support.
        </div>
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
