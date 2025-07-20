// 🔐 APA-HARDENED PAGE: /setup-profile
// General Profile Setup (Adults & Children)

/**
 * Purpose:
 *   - General profile customization for all users
 *   - Profile photo upload, bio, preferences
 *   - Different from /child/onboarding (nickname-specific)
 * 
 * Note:
 *   - Child nickname setup happens at /child/onboarding
 *   - This page is for general profile customization
 */

export default function SetupProfilePage() {
  return (
    <main className="max-w-xl mx-auto p-8 text-center text-gray-700">
      <h1 className="text-2xl font-bold mb-4">Set Up Your Profile</h1>
      <p className="mb-4">
        This is where you'll upload a profile photo, write a bio, and customize your profile.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          💡 <strong>For children:</strong> Nickname setup happens during your 
          <a href="/child/onboarding" className="underline">first login experience</a>.
        </p>
      </div>
      <p className="text-sm text-neutral-500">
        Profile customization features are coming soon.
      </p>
    </main>
  );
}
