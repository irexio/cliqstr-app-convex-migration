'use client';

// 🔐 APA-HARDENED PAGE: /child/onboarding
// Child First Login - Nickname Setup Flow

/**
 * Purpose:
 *   - Child's first login experience after parent approval
 *   - Allows child to set their own nickname (3-20 chars, no profanity)
 *   - Parents can view but not control the nickname (APA compliance)
 *   - Nickname used in comments, posts, member lists, dashboards
 * 
 * Flow:
 *   1. Parent approves child account → child gets login credentials
 *   2. Child logs in for first time → redirected here
 *   3. Child chooses nickname → saved to User.nickname field
 *   4. Child redirected to /my-cliqs-dashboard
 * 
 * Database:
 *   - Requires User.nickname field (not yet implemented)
 *   - Validation: 3-20 chars, letters/numbers/basic symbols, no profanity
 */

export default function ChildOnboardingPage() {
  return (
    <main className="max-w-xl mx-auto p-8 text-center">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Cliqstr! 🎉
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Let's set up your profile so your friends can recognize you!
        </p>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Choose Your Nickname
          </h2>
          
          <p className="text-sm text-gray-500 mb-4">
            This is how you'll appear to other members in your cliqs. 
            You can always change it later!
          </p>
          
          <div className="text-center py-8">
            <p className="text-lg text-gray-400 italic">
              🚧 Nickname setup coming soon!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              For now, you'll use your username in cliqs.
            </p>
          </div>
          
          <div className="mt-6">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              onClick={() => window.location.href = '/my-cliqs-dashboard'}
            >
              Continue to My Cliqs
            </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">
          Need help? Ask your parent or guardian to contact support.
        </p>
      </div>
    </main>
  );
}
