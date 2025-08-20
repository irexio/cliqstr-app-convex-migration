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
    suspended?: boolean;
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
  const [roleDraft, setRoleDraft] = useState<Record<string, string>>({});
  
  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (roleFilter && roleFilter !== 'All') params.set('role', roleFilter);
        const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.reason || 'Failed to load users');
        }
        const data = await res.json();
        setUsers((data.items || []) as User[]);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [roleFilter]);

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
  const handleUserAction = async (userId: string, action: 'approve' | 'deactivate' | 'delete' | 'suspend' | 'unsuspend') => {
    setActionLoading(userId);
    setError('');
    setSuccess('');
    
    try {
      if (action === 'delete') {
        // Default to soft delete
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'soft_delete' }),
        });
        if (!res.ok) throw new Error('Soft delete failed');
        // Remove from current view (list excludes deleted by default)
        setUsers(prev => prev.filter(u => u.id !== userId));
        setSuccess('User soft-deleted');
      } else {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.reason || 'Action failed');
        }
        if (action === 'approve') {
          setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            const acc = u.account ?? { id: '', role: 'Adult', plan: null, isApproved: false };
            return { ...u, account: { ...acc, isApproved: true } };
          }));
          setSuccess('User approved');
        } else if (action === 'deactivate') {
          setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            const acc = u.account ?? { id: '', role: 'Adult', plan: null, isApproved: false };
            return { ...u, account: { ...acc, isApproved: false } };
          }));
          setSuccess('User deactivated');
        } else if (action === 'suspend') {
          setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            const acc = u.account ?? { id: '', role: 'Adult', plan: null, isApproved: false };
            return { ...u, account: { ...acc, suspended: true } };
          }));
          setSuccess('User suspended');
        } else if (action === 'unsuspend') {
          setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            const acc = u.account ?? { id: '', role: 'Adult', plan: null, isApproved: false };
            return { ...u, account: { ...acc, suspended: false } };
          }));
          setSuccess('User unsuspended');
        }
      }
    } catch (err) {
      console.error('Error performing action:', err);
      setError(err instanceof Error ? err.message : 'Operation failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle role change
  const handleChangeRole = async (userId: string, nextRole: string) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_role', targetRole: nextRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.reason || 'Failed to change role');
      }
      setUsers(prev => prev.map(u => u.id === userId ? {
        ...u,
        account: {
          id: u.account?.id || '',
          role: nextRole,
          plan: u.account?.plan ?? null,
          isApproved: u.account?.isApproved ?? true,
          suspended: u.account?.suspended ?? false,
        }
      } : u));
      setSuccess('Role updated');
    } catch (err) {
      console.error('Error changing role:', err);
      setError(err instanceof Error ? err.message : 'Failed to change role');
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
                    {user.account?.suspended && (
                      <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 align-middle">Suspended</span>
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
                      
                      {user.account?.suspended ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'unsuspend')}
                          disabled={actionLoading === user.id}
                          className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                        >
                          {actionLoading === user.id ? '...' : 'Unsuspend'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          disabled={actionLoading === user.id}
                          className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                        >
                          {actionLoading === user.id ? '...' : 'Suspend'}
                        </button>
                      )}

                      {/* Role change controls */}
                      <div className="flex items-center gap-1">
                        <select
                          value={roleDraft[user.id] ?? user.account?.role ?? 'Adult'}
                          onChange={(e) => setRoleDraft(prev => ({ ...prev, [user.id]: e.target.value }))}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Parent">Parent</option>
                          <option value="Adult">Adult</option>
                          <option value="Child">Child</option>
                        </select>
                        <button
                          onClick={() => handleChangeRole(user.id, roleDraft[user.id] ?? user.account?.role ?? 'Adult')}
                          disabled={actionLoading === user.id}
                          className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800"
                          title="Change role"
                        >
                          {actionLoading === user.id ? '...' : 'Update Role'}
                        </button>
                      </div>

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
