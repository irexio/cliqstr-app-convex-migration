'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MyProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  about: string | null;
  birthdate: Date | null;
  showYear: boolean;
}

interface EditProfileFormProps {
  profile: MyProfile;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}

export default function EditProfileForm({ profile, avatarUrl, bannerUrl }: EditProfileFormProps) {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [username, setUsername] = useState(profile.username);
  const [about, setAbout] = useState(profile.about || '');
  const [birthdate, setBirthdate] = useState(
    profile.birthdate ? new Date(profile.birthdate).toISOString().split('T')[0] : ''
  );
  const [showYear, setShowYear] = useState(profile.showYear);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        username: username.trim(),
        about: about.trim() || null,
        birthdate: birthdate ? new Date(birthdate).toISOString() : null,
        showYear,
        image: avatarUrl,
        bannerImage: bannerUrl,
      };

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Redirect to the user's updated profile
      if (data.username) {
        router.push(`/profile/${data.username}`);
      } else {
        router.push('/my-cliqs-dashboard'); // fallback
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* First Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          First Name
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your first name"
        />
      </div>

      {/* Last Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Last Name
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your last name"
        />
      </div>

      {/* Username */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 px-2">@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="username"
            required
          />
        </div>
      </div>

      {/* About */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About
        </label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-gray-500 mt-2">
          {about.length}/500 characters
        </p>
      </div>

      {/* Birthdate */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Birthdate
        </label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-2">
          This is for social display only. Your account birthdate remains unchanged for age verification.
        </p>
      </div>

      {/* Show Year Toggle */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          id="showYear"
          checked={showYear}
          onChange={(e) => setShowYear(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="showYear" className="text-sm font-medium text-gray-700">
          Show birth year publicly
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
