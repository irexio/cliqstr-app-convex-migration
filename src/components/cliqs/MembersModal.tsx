"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MembersModalProps {
  cliqId: string;
  open: boolean;
  onClose: () => void;
}

export default function MembersModal({ cliqId, open, onClose }: MembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`/api/cliqs/${cliqId}/members`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then(data => setMembers(data.members || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [cliqId, open]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    // PATCH/PUT to your API endpoint for updating member roles
    await fetch(`/api/cliqs/${cliqId}/member-actions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, role: newRole }),
    });
    setMembers(members =>
      members.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-6 rounded-lg bg-white">
        <DialogTitle className="text-xl font-bold mb-2">Members</DialogTitle>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4">Name/Email</th>
                  <th className="text-left py-2 pr-4">Role</th>
                  <th className="text-left py-2">Set Role</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id}>
                    <td className="py-2 pr-4">
                      <div>{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </td>
                    <td className="py-2 pr-4">{member.role}</td>
                    <td className="py-2">
                      <select
                        className="border rounded px-2 py-1"
                        value={member.role}
                        onChange={e => handleRoleChange(member.id, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
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
