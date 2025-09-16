'use client';

import { useState, useEffect } from 'react';

interface Cliq {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  description?: string;
  createdAt: string;
  memberCount: number;
  isPrivate: boolean;
}

interface CliqMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string; // 'owner', 'admin', 'member'
  joinedAt: string;
}

export default function CliqManagement() {
  const [cliqs, setCliqs] = useState<Cliq[]>([]);
  const [selectedCliq, setSelectedCliq] = useState<string | null>(null);
  const [members, setMembers] = useState<CliqMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  
  // Fetch cliqs
  useEffect(() => {
    async function fetchCliqs() {
      try {
        const res = await fetch('/api/admin/cliqs', { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.reason || 'Failed to load cliqs');
        }
        const data = await res.json();
        setCliqs((data.items || []) as Cliq[]);
      } catch (err) {
        console.error('Error fetching cliqs:', err);
        setError('Failed to load cliqs. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchCliqs();
  }, []);
  
  // Fetch members when a cliq is selected
  useEffect(() => {
    if (!selectedCliq) {
      setMembers([]);
      return;
    }
    
    async function fetchCliqMembers() {
      setMembersLoading(true);
      
      try {
        // This would be a real API call in production
        // Mocked data for development
        const mockMembers: CliqMember[] = [
          {
            id: 'm1',
            userId: '101',
            username: 'AdminUser',
            email: 'admin@example.com',
            role: 'owner',
            joinedAt: '2023-03-15T10:00:00Z'
          },
          {
            id: 'm2',
            userId: '102',
            username: 'ParentUser',
            email: 'parent@example.com',
            role: 'admin',
            joinedAt: '2023-03-16T10:00:00Z'
          },
          {
            id: 'm3',
            userId: '103',
            username: 'ChildUser',
            email: 'child@example.com',
            role: 'member',
            joinedAt: '2023-03-17T10:00:00Z'
          },
          {
            id: 'm4',
            userId: '104',
            username: 'AdultUser',
            email: 'adult@example.com',
            role: 'member',
            joinedAt: '2023-03-18T10:00:00Z'
          }
        ];
        
        // Only show these members for a specific cliq to simulate different members per cliq
        if (selectedCliq === '1002') {
          mockMembers.splice(2, 2); // Remove some members for this cliq
        } else if (selectedCliq === '1003') {
          mockMembers.splice(0, 2); // Remove different members for this cliq
        }

        setMembers(mockMembers);
      } catch (err) {
        console.error(`Error fetching members for cliq ${selectedCliq}:`, err);
        setError('Failed to load cliq members. Please try again.');
      } finally {
        setMembersLoading(false);
      }
    }

    fetchCliqMembers();
  }, [selectedCliq]);

  // Handle cliq deletion
  const handleDeleteCliq = async (cliqId: string, cliqName: string) => {
    if (!confirm(`Are you sure you want to delete "${cliqName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(cliqId);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`/api/admin/cliqs/${cliqId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete cliq');
      }
      
      // Remove from current view
      setCliqs(prev => prev.filter(c => c.id !== cliqId));
      if (selectedCliq === cliqId) {
        setSelectedCliq(null);
        setMembers([]);
      }
      setSuccess(`Cliq "${cliqName}" deleted successfully`);
    } catch (err) {
      console.error('Error deleting cliq:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete cliq');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle remove member action
  const handleRemoveMember = async (memberId: string) => {
    setActionLoading(memberId);
    
    try {
      // This would be a real API call in production
      console.log(`Removing member ${memberId} from cliq ${selectedCliq}`);
      
      // Mock success - update local state
      setMembers(prevMembers => 
        prevMembers.filter(member => member.id !== memberId)
      );
      
      // Update member count in cliq list
      setCliqs(prevCliqs => 
        prevCliqs.map(cliq => 
          cliq.id === selectedCliq 
            ? {...cliq, memberCount: cliq.memberCount - 1}
            : cliq
        )
      );
      
    } catch (err) {
      console.error(`Error removing member ${memberId} from cliq ${selectedCliq}:`, err);
      setError('Failed to remove member. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Get the name of the currently selected cliq
  const selectedCliqName = selectedCliq
    ? cliqs.find(cliq => cliq.id === selectedCliq)?.name
    : null;

  if (loading) {
    return <div className="text-center py-10">Loading cliqs...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Cliq Management</h2>
      
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cliq List */}
        <div className="lg:col-span-1 border border-gray-200 rounded overflow-hidden">
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <h3 className="font-medium">Cliqs</h3>
          </div>
          
          <div className="overflow-y-auto max-h-[500px]">
            {cliqs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No cliqs found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cliqs.map(cliq => (
                  <div
                    key={cliq.id}
                    className={`p-3 border-b border-gray-100 last:border-b-0 ${
                      selectedCliq === cliq.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <button
                        onClick={() => setSelectedCliq(cliq.id)}
                        className="flex-1 text-left hover:bg-gray-50 p-1 rounded"
                      >
                        <div className="font-medium">{cliq.name}</div>
                        <div className="text-sm text-gray-500">
                          {cliq.memberCount} members
                        </div>
                      </button>
                      <div className="flex gap-2 ml-2">
                        <div className="text-xs px-2 py-1 rounded bg-gray-200">
                          {cliq.isPrivate ? 'Private' : 'Public'}
                        </div>
                        <button
                          onClick={() => handleDeleteCliq(cliq.id, cliq.name)}
                          disabled={actionLoading === cliq.id}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50 disabled:opacity-50"
                        >
                          {actionLoading === cliq.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Members Panel */}
        <div className="lg:col-span-2 border border-gray-200 rounded overflow-hidden">
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <h3 className="font-medium">
              {selectedCliqName 
                ? `Members of ${selectedCliqName}` 
                : 'Select a cliq to view members'}
            </h3>
          </div>
          
          {!selectedCliq ? (
            <div className="p-10 text-center text-gray-500">
              Select a cliq from the list to view its members
            </div>
          ) : membersLoading ? (
            <div className="p-10 text-center text-gray-500">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No members found for this cliq
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Joined</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{member.username}</td>
                    <td className="p-3">{member.email}</td>
                    <td className="p-3">
                      <span className={`
                        px-2 py-1 rounded text-xs
                        ${member.role === 'owner' ? 'bg-purple-100 text-purple-700' : ''}
                        ${member.role === 'admin' ? 'bg-blue-100 text-blue-700' : ''}
                        ${member.role === 'member' ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={actionLoading === member.id}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          {actionLoading === member.id ? '...' : 'Remove'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
