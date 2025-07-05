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
  
  // Fetch cliqs
  useEffect(() => {
    async function fetchCliqs() {
      try {
        // This would be a real API call in production
        // Mocked data for development
        const mockCliqs: Cliq[] = [
          {
            id: '1001',
            name: 'Book Club',
            creatorId: '101',
            creatorName: 'AdminUser',
            description: 'A community of book lovers',
            createdAt: '2023-03-15T10:00:00Z',
            memberCount: 12,
            isPrivate: false
          },
          {
            id: '1002',
            name: 'Gaming Group',
            creatorId: '102',
            creatorName: 'ParentUser',
            description: 'For gamers of all ages',
            createdAt: '2023-04-01T10:00:00Z',
            memberCount: 25,
            isPrivate: false
          },
          {
            id: '1003',
            name: 'Science Club',
            creatorId: '104',
            creatorName: 'AdultUser',
            description: 'For science enthusiasts',
            createdAt: '2023-04-15T10:00:00Z',
            memberCount: 8,
            isPrivate: true
          },
          {
            id: '1004',
            name: 'Art & Crafts',
            creatorId: '103',
            creatorName: 'ChildUser',
            description: 'Share your creative works',
            createdAt: '2023-05-01T10:00:00Z',
            memberCount: 15,
            isPrivate: false
          }
        ];

        setCliqs(mockCliqs);
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
                  <button
                    key={cliq.id}
                    onClick={() => setSelectedCliq(cliq.id)}
                    className={`p-3 text-left w-full hover:bg-gray-50 flex justify-between items-center ${
                      selectedCliq === cliq.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium">{cliq.name}</div>
                      <div className="text-sm text-gray-500">
                        {cliq.memberCount} members
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-gray-200">
                      {cliq.isPrivate ? 'Private' : 'Public'}
                    </div>
                  </button>
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
