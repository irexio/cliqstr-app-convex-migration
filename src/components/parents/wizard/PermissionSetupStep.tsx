'use client';

interface ChildData {
  username: string;
  password: string;
  permissions: {
    canCreatePublicCliqs: boolean;
    canCreatePrivateCliqs: boolean;
    canJoinPublicCliqs: boolean;
    canInviteOthers: boolean;
    canInviteAdults: boolean;
    requiresParentApproval: boolean;
    canUploadVideos: boolean;
    canShareYouTubeVideos: boolean;
    canAccessGames: boolean;
    silentMonitoring: boolean;
  };
}

interface PermissionSetupStepProps {
  childData: ChildData;
  setChildData: (data: ChildData) => void;
  onCreateChild: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function PermissionSetupStep({ 
  childData, 
  setChildData, 
  onCreateChild, 
  onBack, 
  loading 
}: PermissionSetupStepProps) {
  
  const updatePermission = (key: keyof ChildData['permissions'], value: boolean) => {
    setChildData({
      ...childData,
      permissions: {
        ...childData.permissions,
        [key]: value
      }
    });
  };

  const setPreset = (preset: 'restrictive' | 'balanced' | 'permissive') => {
    let newPermissions;
    
    switch (preset) {
      case 'restrictive':
        newPermissions = {
          canCreatePublicCliqs: false,
          canCreatePrivateCliqs: true,
          canJoinPublicCliqs: false,
          canInviteOthers: false,
          canInviteAdults: false,
          requiresParentApproval: true,
          canUploadVideos: false,
          canShareYouTubeVideos: false,
          canAccessGames: false,
          silentMonitoring: true,
        };
        break;
      case 'balanced':
        newPermissions = {
          canCreatePublicCliqs: false,
          canCreatePrivateCliqs: true,
          canJoinPublicCliqs: true,
          canInviteOthers: true,
          canInviteAdults: false,
          requiresParentApproval: true,
          canUploadVideos: false,
          canShareYouTubeVideos: true,
          canAccessGames: true,
          silentMonitoring: true,
        };
        break;
      case 'permissive':
        newPermissions = {
          canCreatePublicCliqs: true,
          canCreatePrivateCliqs: true,
          canJoinPublicCliqs: true,
          canInviteOthers: true,
          canInviteAdults: true,
          requiresParentApproval: false,
          canUploadVideos: true,
          canShareYouTubeVideos: true,
          canAccessGames: true,
          silentMonitoring: false,
        };
        break;
    }
    
    setChildData({
      ...childData,
      permissions: newPermissions
    });
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
          <span className="text-2xl">🛡️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety & Permission Settings</h2>
        <p className="text-gray-600">
          Configure what <strong>{childData.username}</strong> can do on Cliqstr to ensure their safety.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Quick Presets */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setPreset('restrictive')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 focus:outline-none focus:border-blue-500 text-left"
            >
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🔒</span>
                <span className="font-medium">Most Restrictive</span>
              </div>
              <p className="text-sm text-gray-600">Maximum safety, minimal social features</p>
            </button>
            
            <button
              onClick={() => setPreset('balanced')}
              className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:border-blue-300 focus:outline-none focus:border-blue-500 text-left"
            >
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">⚖️</span>
                <span className="font-medium">Balanced</span>
              </div>
              <p className="text-sm text-gray-600">Recommended for most children</p>
            </button>
            
            <button
              onClick={() => setPreset('permissive')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 focus:outline-none focus:border-blue-500 text-left"
            >
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🌟</span>
                <span className="font-medium">More Freedom</span>
              </div>
              <p className="text-sm text-gray-600">For older, responsible children</p>
            </button>
          </div>
        </div>

        {/* Detailed Permissions */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Custom Permissions</h3>
          
          {/* Cliq Management */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Cliq Management</h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.canCreatePrivateCliqs}
                  onChange={(e) => updatePermission('canCreatePrivateCliqs', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Can create private cliqs with friends</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.canCreatePublicCliqs}
                  onChange={(e) => updatePermission('canCreatePublicCliqs', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Can create public cliqs (visible to everyone)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.canJoinPublicCliqs}
                  onChange={(e) => updatePermission('canJoinPublicCliqs', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Can join public cliqs created by others</span>
              </label>
            </div>
          </div>

          {/* Social Features */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Social Features</h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.canInviteOthers}
                  onChange={(e) => updatePermission('canInviteOthers', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Can invite other children to cliqs</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.canInviteAdults}
                  onChange={(e) => updatePermission('canInviteAdults', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Can invite adults to cliqs</span>
              </label>
            </div>
          </div>

          {/* Content & Media */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Content & Media</h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.canUploadVideos}
                  onChange={(e) => updatePermission('canUploadVideos', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Can upload their own videos</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.canShareYouTubeVideos}
                  onChange={(e) => updatePermission('canShareYouTubeVideos', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Can share YouTube videos</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.canAccessGames}
                  onChange={(e) => updatePermission('canAccessGames', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Can access games and interactive features</span>
              </label>
            </div>
          </div>

          {/* Safety & Monitoring */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Safety & Monitoring</h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.requiresParentApproval}
                  onChange={(e) => updatePermission('requiresParentApproval', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Require parent approval for cliq invitations</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={childData.permissions.silentMonitoring}
                  onChange={(e) => updatePermission('silentMonitoring', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Enable silent activity monitoring</span>
              </label>
            </div>
            <p className="text-xs text-yellow-700 mt-3">
              ⚠️ These safety features help protect your child and ensure APA compliance.
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onBack}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Back
          </button>
          
          <button
            onClick={onCreateChild}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Account...
              </span>
            ) : (
              'Create Child Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
