'use client';

import { useState, useEffect } from 'react';

interface StorageUser {
  id: string;
  email: string;
  username: string;
  plan: string;
  storageUsed: number;
  storageLimit: number;
  postCount: number;
  postLimit: number;
  lastActive: string;
}

export default function StorageSummary() {
  const [users, setUsers] = useState<StorageUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Storage thresholds for warnings
  const storageThreshold = 0.85; // 85% of limit
  const postThreshold = 0.85; // 85% of limit
  
  // Fetch storage usage data
  useEffect(() => {
    async function fetchStorageData() {
      try {
        // This would be a real API call in production
        // Mocked data for development
        const mockUsers: StorageUser[] = [
          {
            id: '101',
            email: 'heavy.user@example.com',
            username: 'HeavyUser',
            plan: 'basic',
            storageUsed: 4600, // MB
            storageLimit: 5000, // MB
            postCount: 45,
            postLimit: 50,
            lastActive: '2023-06-28T10:00:00Z'
          },
          {
            id: '102',
            email: 'power.user@example.com',
            username: 'PowerUser',
            plan: 'premium',
            storageUsed: 18000, // MB
            storageLimit: 25000, // MB
            postCount: 130,
            postLimit: 250,
            lastActive: '2023-06-29T10:00:00Z'
          },
          {
            id: '103',
            email: 'family.parent@example.com',
            username: 'FamilyParent',
            plan: 'family',
            storageUsed: 42000, // MB
            storageLimit: 50000, // MB
            postCount: 320,
            postLimit: 500,
            lastActive: '2023-06-30T10:00:00Z'
          },
          {
            id: '104',
            email: 'light.user@example.com',
            username: 'LightUser',
            plan: 'basic',
            storageUsed: 500, // MB
            storageLimit: 5000, // MB
            postCount: 12,
            postLimit: 50,
            lastActive: '2023-06-25T10:00:00Z'
          },
          {
            id: '105',
            email: 'test.user@example.com',
            username: 'TestUser',
            plan: 'test',
            storageUsed: 250, // MB
            storageLimit: 1000, // MB
            postCount: 5,
            postLimit: 10,
            lastActive: '2023-06-27T10:00:00Z'
          }
        ];

        // Filter for users approaching their limits
        const usersNearingLimits = mockUsers.filter(user => 
          (user.storageUsed / user.storageLimit > storageThreshold) || 
          (user.postCount / user.postLimit > postThreshold)
        );

        setUsers(usersNearingLimits);
      } catch (err) {
        console.error('Error fetching storage data:', err);
        setError('Failed to load storage summary. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchStorageData();
  }, []);
  
  // Format storage size
  const formatStorage = (megabytes: number) => {
    if (megabytes >= 1000) {
      return `${(megabytes / 1000).toFixed(1)} GB`;
    }
    return `${megabytes} MB`;
  };
  
  // Calculate usage percentage
  const getUsagePercent = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  if (loading) {
    return <div className="text-center py-10">Loading storage summary...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Storage & Activity Summary</h2>
      
      <p className="text-sm text-gray-600 mb-4">
        Users approaching their plan limits (using over 85% of storage or posts)
      </p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {users.length === 0 ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded text-green-700">
          No users are currently approaching their storage or post limits.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Plan</th>
                <th className="p-3 text-left">Storage Used</th>
                <th className="p-3 text-left">Posts Used</th>
                <th className="p-3 text-left">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="p-3">
                    <span className={`
                      ${user.plan === 'premium' ? 'text-purple-600' : ''}
                      ${user.plan === 'test' ? 'text-orange-600' : ''}
                    `}>
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="flex-1 mr-4">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              getUsagePercent(user.storageUsed, user.storageLimit) > 90 
                                ? 'bg-red-500' 
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${getUsagePercent(user.storageUsed, user.storageLimit)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="whitespace-nowrap">
                        <span className="font-medium">
                          {formatStorage(user.storageUsed)}
                        </span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-gray-500">
                          {formatStorage(user.storageLimit)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="flex-1 mr-4">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              getUsagePercent(user.postCount, user.postLimit) > 90 
                                ? 'bg-red-500' 
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${getUsagePercent(user.postCount, user.postLimit)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="whitespace-nowrap">
                        <span className="font-medium">
                          {user.postCount}
                        </span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-gray-500">
                          {user.postLimit}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
