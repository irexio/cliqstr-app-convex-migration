'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  account?: {
    id: string;
    role: string;
    plan: string | null;
    isApproved: boolean;
  };
  myProfile?: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [passwordResetLoading, setPasswordResetLoading] = useState<string | null>(null);
  
  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        // This would be a real API call in production
        // Mocked data for development
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@example.com',
            account: {
              id: '101',
              role: 'Admin',
              plan: 'premium',
              isApproved: true
            },
            myProfile: {
              id: '101',
              username: 'AdminUser'
            },
            createdAt: '2023-04-01T10:00:00Z'
          },
          {
            id: '2',
            email: 'parent@example.com',
            account: {
              id: '102',
              role: 'Parent',
              plan: 'family',
              isApproved: true
            },
            myProfile: {
              id: '102',
              username: 'ParentUser'
            },
            createdAt: '2023-04-05T10:00:00Z'
          },
          {
            id: '3',
            email: 'child@example.com',
            account: {
              id: '103',
              role: 'Child',
              plan: null,
              isApproved: false
            },
            myProfile: {
              id: '103',
              username: 'ChildUser'
            },
            createdAt: '2023-04-10T10:00:00Z'
          },
          {
            id: '4',
            email: 'adult@example.com',
            account: {
              id: '104',
              role: 'Adult',
              plan: 'basic',
              isApproved: true
            },
            myProfile: {
              id: '104',
              username: 'AdultUser'
            },
            createdAt: '2023-04-15T10:00:00Z'
          },
          {
            id: '5',
            email: 'tester@example.com',
            account: {
              id: '105',
              role: 'Adult',
              plan: 'test',
              isApproved: true
            },
            myProfile: {
              id: '105',
              username: 'TesterUser'
            },
            createdAt: '2023-05-01T10:00:00Z'
          }
        ];

        setUsers(mockUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Filter users by role
  const filteredUsers = roleFilter === 'All'
    ? users
    : users.filter(user => user.account?.role === roleFilter);

  // Handle password reset email sending
  const handlePasswordReset = async (userId: string, email: string) => {
    setPasswordResetLoading(userId);
    setError('');
    setSuccess('');
    
    try {
      // In production, this would call your actual API endpoint
      // For now we'll log it and simulate a successful call
      console.log(`Sending password reset email to ${email}`);
      
      // This would be a real API call in production
      const response = await fetch('/api/admin/force-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send reset email');
      }
      
      // Show success message
      setSuccess(`Password reset email sent to ${email}`);
    } catch (err: any) {
      console.error('Error sending password reset:', err);
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setPasswordResetLoading(null);
    }
  };

  // Handle user actions
  const handleUserAction = async (userId: string, action: 'approve' | 'deactivate' | 'delete') => {
    setActionLoading(userId);
    
    try {
      // This would be a real API call in production
      console.log(`${action} user ${userId}`);
      
      // Mock success - update local state to reflect the change
      if (action === 'approve') {
        setUsers(users.map(user => {
          if (user.id === userId && user.account) {
            return {
              ...user, 
              account: {
                ...user.account,
                isApproved: true
              }
            };
          }
          return user;
        }));
      } else if (action === 'delete') {
        setUsers(users.filter(user => user.id !== userId));
      } else if (action === 'deactivate') {
        // In a real app, you might set an 'active' flag or similar
        console.log(`User ${userId} deactivated`);
      }
      
    } catch (err) {
      console.error(`Error performing ${action} on user ${userId}:`, err);
      setError(`Failed to ${action} user. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle bulk action - remove test plan users
  const handleRemoveTestUsers = async () => {
    if (!confirm('Are you sure you want to remove ALL users on the Test Plan? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading('bulk-delete');
    
    try {
      // This would be a real API call in production
      console.log('Removing all test plan users');
      
      // Mock success - update local state
      setUsers(users.filter(user => user.account?.plan !== 'test'));
      
    } catch (err) {
      console.error('Error removing test plan users:', err);
      setError('Failed to remove test users. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        
        <div className="flex gap-4">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
            <option value="Adult">Adult</option>
          </select>
          
          {/* Test account cleanup button */}
          <button
            onClick={handleRemoveTestUsers}
            disabled={actionLoading === 'bulk-delete'}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading === 'bulk-delete' ? 'Processing...' : 'Remove All Test Plan Users'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Users table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
                  No users found with the selected filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <span className="font-medium">{user.myProfile?.username || 'No Profile'}</span>
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.account?.role || 'N/A'}</td>
                  <td className="p-3">
                    {user.account?.plan ? (
                      <span className={`${user.account.plan === 'test' ? 'text-orange-600' : ''}`}>
                        {user.account.plan.charAt(0).toUpperCase() + user.account.plan.slice(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="p-3">
                    {user.account?.isApproved ? (
                      <span className="text-green-600">Approved</span>
                    ) : (
                      <span className="text-orange-600">Pending</span>
                    )}
                  </td>
                  <td className="p-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Force Password Reset button */}
                      <button
                        onClick={() => handlePasswordReset(user.id, user.email)}
                        disabled={passwordResetLoading === user.id || actionLoading === user.id}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        title="Send password reset email"
                      >
                        {passwordResetLoading === user.id ? '...' : '🔐 Reset'}
                      </button>
                      
                      {!user.account?.isApproved && (
                        <button
                          onClick={() => handleUserAction(user.id, 'approve')}
                          disabled={actionLoading === user.id}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          {actionLoading === user.id ? '...' : 'Approve'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleUserAction(user.id, 'deactivate')}
                        disabled={actionLoading === user.id}
                        className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                      >
                        {actionLoading === user.id ? '...' : 'Deactivate'}
                      </button>
                      
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        disabled={actionLoading === user.id}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        {actionLoading === user.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
