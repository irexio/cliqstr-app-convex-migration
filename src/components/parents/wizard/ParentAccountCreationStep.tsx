'use client';

import { useState } from 'react';

interface ParentAccountCreationStepProps {
  inviteCode: string;
  invitedEmail?: string;
  childName?: string;
  inviterName?: string;
  onAccountCreated: (email: string, password: string) => void;
  loading: boolean;
}

export default function ParentAccountCreationStep({ 
  inviteCode,
  invitedEmail,
  childName,
  inviterName,
  onAccountCreated,
  loading 
}: ParentAccountCreationStepProps) {
  const [email, setEmail] = useState(invitedEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [redAlertAccepted, setRedAlertAccepted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Red Alert validation (APA compliance requirement)
    if (!redAlertAccepted) {
      newErrors.redAlert = 'You must accept the safety agreement to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAccountCreated(email, password);
    }
  };

  const updateField = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
          <span className="text-2xl">🛡️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Parent Account</h2>
        <p className="text-gray-600">
          To approve and control <strong>{childName}</strong>'s account on Cliqstr, you need to create a free parent account.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Context Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Invitation Details</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Child's Name:</span>
              <span className="font-medium">{childName}</span>
            </div>
            <div className="flex justify-between">
              <span>Invited by:</span>
              <span className="font-medium">{inviterName}</span>
            </div>
            <div className="flex justify-between">
              <span>Account Type:</span>
              <span className="font-medium text-green-600">Free for invited parents</span>
            </div>
          </div>
        </div>

        {/* Account Creation Form */}
        <div className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Parent Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                errors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter your email address"
              disabled={!!invitedEmail} // Disable if pre-filled from invite
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
            {invitedEmail && (
              <p className="mt-1 text-xs text-green-600">
                ✓ This email matches your invitation and will be automatically verified
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Create Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => updateField('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                errors.password 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Create a secure password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                errors.confirmPassword 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Red Alert Safety Agreement (APA Compliance) */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="redAlert"
                checked={redAlertAccepted}
                onChange={(e) => {
                  setRedAlertAccepted(e.target.checked);
                  if (errors.redAlert) {
                    setErrors({ ...errors, redAlert: '' });
                  }
                }}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <label htmlFor="redAlert" className="text-sm font-medium text-red-800">
                  🚨 Required Safety Agreement
                </label>
                <div className="text-sm text-red-700 mt-1">
                  <p className="font-medium mb-2">I understand and agree that:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>I am responsible for monitoring my child's activity on Cliqstr</li>
                    <li>I will review and approve all cliq invitations my child receives</li>
                    <li>I understand the safety features and parental controls available</li>
                    <li>I will maintain active oversight of my child's social media interactions</li>
                  </ul>
                </div>
              </div>
            </div>
            {errors.redAlert && (
              <p className="mt-2 text-sm text-red-600 ml-7">{errors.redAlert}</p>
            )}
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-600">💡</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                <div className="text-sm text-yellow-700 mt-1 space-y-1">
                  <p>• Save this information to log in anytime to manage your child's account</p>
                  <p>• You'll be able to set safety permissions and monitor activity</p>
                  <p>• Your account is free as an invited parent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Account...
              </span>
            ) : (
              'Create Account & Continue'
            )}
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
