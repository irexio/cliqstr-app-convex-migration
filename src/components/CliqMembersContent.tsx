'use client';

import { useEffect, useState } from 'react';

interface Member {
  id: string;
  profile: {
    username: string;
    birthdate: string;
    role: string;
    isApproved: boolean;
  };
}

interface CliqMembersContentProps {
  cliqId: string;
  currentUserId: string;
}

export default function CliqMembersContent({
  cliqId,
  currentUserId,
}: CliqMembersContentProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/cliqs/${cliqId}/members`);
        const data = await res.json();
        setMembers(data.members || []);
      } catch (err) {
        console.error('Failed to load members', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [cliqId]);

  if (loading) {
    return <div className="p-6 text-center">Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="p-4 border rounded-md">
          <p className="font-semibold">Username: {member.profile.username}</p>
          <p className="text-sm text-gray-600">Role: {member.profile.role}</p>
          <p className="text-sm text-gray-600">Birthdate: {member.profile.birthdate}</p>
          <p className="text-sm text-gray-600">
            Approved: {member.profile.isApproved ? 'Yes' : 'No'}
          </p>
        </div>
      ))}
    </div>
  );
}
