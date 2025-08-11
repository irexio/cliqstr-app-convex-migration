'use client';

interface SuccessStepProps {
  childUsername: string;
  onContinue: () => void;
  onCreateAnother: () => void;
}

export default function SuccessStep({ childUsername, onContinue, onCreateAnother }: SuccessStepProps) {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h2>
        <p className="text-gray-600">
          <strong>{childUsername}</strong>'s account is now ready with your chosen safety settings.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Success Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-green-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-green-800">
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Child account <strong>@{childUsername}</strong> is active</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Safety permissions have been applied</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Monitoring and parental controls are enabled</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Your child can now sign in and start using Cliqstr safely</span>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Important Information</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Share the login credentials with your child</p>
            <p>• You can modify permissions anytime from the Parent Dashboard</p>
            <p>• All cliq invitations will require your approval</p>
            <p>• Activity monitoring helps ensure safe interactions</p>
          </div>
        </div>

        {/* Login Credentials Reminder */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Login Credentials</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span className="font-mono font-medium">@{childUsername}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Password:</span>
              <span className="text-gray-500 text-sm">Set by you during setup</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 Consider writing these down in a safe place your child can access.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
          >
            Go to Parent Dashboard
          </button>
          
          <button
            onClick={onCreateAnother}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium"
          >
            Create Another Child Account
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Need help getting started?</p>
          <div className="space-x-4 text-sm">
            <a href="/help/parents" className="text-blue-600 hover:text-blue-700">
              Parent Guide
            </a>
            <span className="text-gray-300">•</span>
            <a href="/help/child-safety" className="text-blue-600 hover:text-blue-700">
              Safety Tips
            </a>
            <span className="text-gray-300">•</span>
            <a href="/support" className="text-blue-600 hover:text-blue-700">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
