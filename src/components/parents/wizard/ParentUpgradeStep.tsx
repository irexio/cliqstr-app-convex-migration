'use client';

interface UserData {
  id: string;
  email: string;
  role: string;
}

interface ParentUpgradeStepProps {
  userData: UserData | null;
  onUpgrade: () => void;
  loading: boolean;
}

export default function ParentUpgradeStep({ userData, onUpgrade, loading }: ParentUpgradeStepProps) {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Parent Account</h2>
        <p className="text-gray-600">
          To manage children on Cliqstr, we need to upgrade your account to Parent status.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Current Account Info */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Current Account</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{userData?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Role:</span>
              <span className="font-medium text-orange-600">{userData?.role}</span>
            </div>
          </div>
        </div>

        {/* Upgrade Info */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">After Upgrade</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">New Role:</span>
              <span className="font-medium text-green-600">Parent</span>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-2">✅ Create and manage child accounts</p>
              <p className="mb-2">✅ Set safety permissions and monitoring</p>
              <p className="mb-2">✅ Approve child invitations to cliqs</p>
              <p>✅ Access comprehensive parental controls</p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Important</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Parent accounts have additional responsibilities for child safety and APA compliance. 
                This upgrade is permanent and cannot be reversed.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onUpgrade}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Upgrading...
              </span>
            ) : (
              'Upgrade to Parent Account'
            )}
          </button>
          
          <button
            onClick={() => window.history.back()}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
