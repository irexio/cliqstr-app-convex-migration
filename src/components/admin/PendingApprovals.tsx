'use client';

import { useState, useEffect } from 'react';

interface ChildUser {
  id: string;
  email: string;
  profile: {
    id: string;
    username: string;
    birthdate: string;
    role: string;
    isApproved: boolean;
    parentId?: string;
    parentEmail?: string;
  };
  createdAt: string;
}

export default function PendingApprovals() {
  const [pendingChildren, setPendingChildren] = useState<ChildUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Fetch pending child accounts
  useEffect(() => {
    async function fetchPendingChildren() {
      try {
        // This would be a real API call in production
        // Mocked data for development
        const mockPendingChildren: ChildUser[] = [
          {
            id: '101',
            email: 'child1@example.com',
            profile: {
              id: '201',
              username: 'ChildUser1',
              birthdate: '2015-06-15',
              role: 'Child',
              isApproved: false,
              parentId: '301',
              parentEmail: 'parent1@example.com'
            },
            createdAt: '2023-05-10T14:30:00Z'
          },
          {
            id: '102',
            email: 'child2@example.com',
            profile: {
              id: '202',
              username: 'ChildUser2',
              birthdate: '2014-03-22',
              role: 'Child',
              isApproved: false,
              parentId: '302',
              parentEmail: 'parent2@example.com'
            },
            createdAt: '2023-05-12T09:15:00Z'
          },
          {
            id: '103',
            email: 'child3@example.com',
            profile: {
              id: '203',
              username: 'ChildUser3',
              birthdate: '2016-11-05',
              role: 'Child',
              isApproved: false
            },
            createdAt: '2023-05-15T16:45:00Z'
          }
        ];

        setPendingChildren(mockPendingChildren);
      } catch (err) {
        console.error('Error fetching pending child accounts:', err);
        setError('Failed to load pending child accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPendingChildren();
  }, []);
  
  // Calculate age (approximate)
  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Handle approval actions
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    
    try {
      // This would be a real API call in production
      console.log(`Approving child account ${id}`);
      
      // Mock success - update local state
      setPendingChildren(prevChildren => 
        prevChildren.filter(child => child.id !== id)
      );
      
    } catch (err) {
      console.error(`Error approving child account ${id}:`, err);
      setError('Failed to approve child account. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle bulk approval
  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    
    setActionLoading('bulk');
    
    try {
      // This would be a real API call in production
      console.log(`Approving ${selectedIds.size} child accounts`);
      
      // Mock success - update local state
      setPendingChildren(prevChildren => 
        prevChildren.filter(child => !selectedIds.has(child.id))
      );
      
      // Clear selection
      setSelectedIds(new Set());
      
    } catch (err) {
      console.error('Error performing bulk approval:', err);
      setError('Failed to approve selected accounts. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Toggle selection for an item
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };
  
  // Toggle selection for all items
  const toggleSelectAll = () => {
    if (selectedIds.size === pendingChildren.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(pendingChildren.map(child => child.id)));
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading pending approvals...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pending Child Approvals</h2>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {selectedIds.size} of {pendingChildren.length} selected
          </span>
          
          <button
            onClick={handleBulkApprove}
            disabled={selectedIds.size === 0 || actionLoading === 'bulk'}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading === 'bulk' ? 'Processing...' : 'Approve Selected'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {pendingChildren.length === 0 ? (
        <div className="bg-gray-50 rounded border border-gray-200 p-10 text-center">
          <p className="text-gray-600">No pending child approvals at this time.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === pendingChildren.length && pendingChildren.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Age</th>
                <th className="p-3 text-left">Parent Email</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingChildren.map(child => (
                <tr key={child.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(child.id)}
                      onChange={() => toggleSelection(child.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3 font-medium">{child.profile.username}</td>
                  <td className="p-3">{child.email}</td>
                  <td className="p-3">
                    {child.profile.birthdate ? calculateAge(child.profile.birthdate) : 'Unknown'}
                  </td>
                  <td className="p-3">
                    {child.profile.parentEmail || (
                      <span className="text-orange-600">No parent linked</span>
                    )}
                  </td>
                  <td className="p-3">
                    {new Date(child.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleApprove(child.id)}
                      disabled={actionLoading === child.id}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === child.id ? 'Processing...' : 'Approve'}
                    </button>
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
