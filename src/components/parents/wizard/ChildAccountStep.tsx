'use client';

import { useState } from 'react';

interface ChildData {
  username: string;
  password: string;
  permissions: any;
}

interface ChildAccountStepProps {
  childData: ChildData;
  setChildData: (data: ChildData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ChildAccountStep({ childData, setChildData, onNext, onBack }: ChildAccountStepProps) {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Username validation
    if (!childData.username) {
      newErrors.username = 'Username is required';
    } else if (childData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(childData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!childData.password) {
      newErrors.password = 'Password is required';
    } else if (childData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (childData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const updateChildData = (field: string, value: string) => {
    setChildData({
      ...childData,
      [field]: value
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <span className="text-2xl">👶</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Child Account</h2>
        <p className="text-gray-600">
          Set up your child's username and password for their Cliqstr account.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <form className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Child's Username
            </label>
            <input
              type="text"
              id="username"
              value={childData.username}
              onChange={(e) => updateChildData('username', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                errors.username 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter a unique username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This will be their @username on Cliqstr (letters, numbers, and underscores only)
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={childData.password}
              onChange={(e) => updateChildData('password', e.target.value)}
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
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                errors.confirmPassword 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Confirm the password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-600">💡</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Account Details</h4>
                <div className="text-sm text-blue-700 mt-1 space-y-1">
                  <p>• Your child will use these credentials to sign in</p>
                  <p>• You can change these later in the parent dashboard</p>
                  <p>• All activity will be monitored for safety</p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
          >
            Next: Set Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
