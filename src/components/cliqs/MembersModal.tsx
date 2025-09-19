"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  joinedAt?: string;
}

interface MembersModalProps {
  cliqId: string;
  open: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

export default function MembersModal({ cliqId, open, onClose, isOwner = false }: MembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`/api/cliqs/${cliqId}/members`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then(data => setMembers(Array.isArray(data.members) ? data.members : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [cliqId, open]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      // Determine the correct action based on the new role
      let action = '';
      if (newRole === 'Moderator') {
        action = 'promote';
      } else if (newRole === 'Member') {
        action = 'demote';
      } else if (newRole === 'remove') {
        action = 'remove';
      }
      
      if (!action) {
        throw new Error(`Unsupported role change: ${newRole}`);
      }
      
      const response = await fetch(`/api/cliqs/${cliqId}/member-actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          targetUserId: memberId, 
          action: action 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update member role');
      }
      
      if (action === 'remove') {
        // Remove the member from the list
        setMembers(members => members.filter(m => m.id !== memberId));
      } else {
        // Update the member's role in the list
        setMembers(members =>
          members.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
        );
      }
      
      // Show success message
      setFeedback({ type: 'success', message: `Member ${action === 'remove' ? 'removed' : 'updated'} successfully` });
    } catch (err: any) {
      console.error('Error updating member:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to update member' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-6 rounded-lg bg-white">
        <DialogTitle className="text-xl font-bold mb-2">Members</DialogTitle>
        {loading && <div className="py-4 text-center text-gray-500">Loading members...</div>}
        {error && <div className="py-4 text-center text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500">Cliq ID: {cliqId}</div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={async () => {
                    try {
                      const url = `${window.location.origin}/cliqs/${cliqId}`;
                      await navigator.clipboard.writeText(url);
                      setFeedback({ type: 'success', message: 'Cliq link copied' });
                      setTimeout(() => setFeedback(null), 1500);
                    } catch {
                      setFeedback({ type: 'error', message: 'Failed to copy link' });
                      setTimeout(() => setFeedback(null), 2000);
                    }
                  }}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                >
                  Copy Cliq Link
                </button>
              )}
              <Link
                href={`/cliqs/${cliqId}/members`}
                className="px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm"
              >
                Open Full Members Page
              </Link>
            </div>
          </div>
        )}
        {!loading && !error && members.length === 0 && (
          <div className="py-6 text-center text-gray-500">Currently no members.</div>
        )}
        {feedback && (
          <div className={`mb-4 p-3 rounded ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {feedback.message}
          </div>
        )}
        {!loading && !error && members.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4">{isOwner ? 'Name/Email' : 'Name'}</th>
                  <th className="text-left py-2 pr-4">Role</th>
                  <th className="text-left py-2">{isOwner ? 'Set Role' : ''}</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id}>
                    <td className="py-2 pr-4">
                      <div>{member.name}</div>
                      <div className="text-xs text-gray-500">
                        {isOwner ? member.email : 'Member'}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{member.role}</td>
                    <td className="py-2">
                      {isOwner ? (
                        <div className="flex gap-2">
                          <select
                            className="border rounded px-2 py-1"
                            value={member.role}
                            onChange={e => handleRoleChange(member.id, e.target.value)}
                          >
                            <option value="Member">Member</option>
                            <option value="Moderator">Moderator</option>
                          </select>
                          <button 
                            onClick={() => handleRoleChange(member.id, 'remove')} 
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
          onClick={onClose}
        >
          Close
        </button>
      </DialogContent>
    </Dialog>
  );
}
