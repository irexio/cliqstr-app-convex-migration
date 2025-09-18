'use client';

import { useState } from 'react';

export default function SecurityClient({ userEmail }: { userEmail: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignOutAllDevices = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // TODO: Implement server route to revoke all sessions
      setMessage('Signed out of all devices (placeholder).');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security and active sessions.</p>
        </div>

        {message && <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6">{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">{error}</div>}

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Address</p>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
                <a href="/account/email" className="text-sm text-blue-600 hover:text-blue-800 underline">Change Email</a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Security</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Password</p>
                  <p className="text-sm text-gray-600">Last changed: Not available</p>
                </div>
                <a href="/account/password" className="text-sm text-blue-600 hover:text-blue-800 underline">Change Password</a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Session</p>
                  <p className="text-sm text-gray-600">This device - Active now</p>
                </div>
                <span className="text-sm text-green-600 font-medium">Current</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={handleSignOutAllDevices}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Signing Out...' : 'Sign Out All Devices'}
                </button>
                <p className="text-xs text-gray-500 mt-2">TODO: implement sign-out-all devices via server route.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">2FA Status</p>
                  <p className="text-sm text-gray-600">Not enabled</p>
                </div>
                <button disabled className="text-sm text-gray-400 cursor-not-allowed">Coming Soon</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">TODO: add 2FA enrollment flow.</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Recovery</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Recovery Options</p>
                  <p className="text-sm text-gray-600">Email recovery available</p>
                </div>
                <a href="/reset-password" className="text-sm text-blue-600 hover:text-blue-800 underline">Reset Password</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a href="/account" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Back</a>
        </div>
      </div>
    </div>
  );
}


