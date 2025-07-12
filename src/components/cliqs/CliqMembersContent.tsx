'use client';

// 🔐 APA-HARDENED — Cliq Members Client Component
// Receives full members array as a prop — no fetchJson required
// Fully detached from any legacy API routes

interface Member {
  id: string;
  profile: {
    username: string;
    role: string;
    isApproved: boolean;
  };
}

interface CliqMembersContentProps {
  members: Member[];
}

export default function CliqMembersContent({ members }: CliqMembersContentProps) {
  if (!members.length) {
    return <div className="p-6 text-center text-gray-500">No members found.</div>;
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="p-4 border rounded-md">
          <p className="font-semibold">Username: {member.profile.username}</p>
          <p className="text-sm text-gray-600">Role: {member.profile.role}</p>
          <p className="text-sm text-gray-600">
            Approved: {member.profile.isApproved ? 'Yes' : 'No'}
          </p>
        </div>
      ))}
    </div>
  );
}

