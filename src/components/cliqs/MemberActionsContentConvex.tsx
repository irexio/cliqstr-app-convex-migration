'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';

interface MemberActionsContentConvexProps {
  cliqId: string;
  currentUserId: string;
}

export default function MemberActionsContentConvex({ 
  cliqId, 
  currentUserId 
}: MemberActionsContentConvexProps) {
  // Get cliq data to verify ownership
  const cliq = useQuery(api.cliqs.getCliq, {
    cliqId: cliqId as Id<"cliqs">,
    userId: currentUserId as Id<"users">
  });

  // Get cliq members
  const members = useQuery(api.cliqs.getCliqMembers, {
    cliqId: cliqId as Id<"cliqs">
  });

  // Loading state
  if (cliq === undefined || members === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-gray-600">Loading members...</p>
      </div>
    );
  }

  // Cliq not found or not authorized
  if (cliq === null) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>You do not have access to manage this cliq.</p>
        <p className="text-sm mt-2">Only the cliq owner can manage members.</p>
      </div>
    );
  }

  // Verify ownership
  if (cliq.ownerId !== currentUserId) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Access denied.</p>
        <p className="text-sm mt-2">Only the cliq owner can manage members.</p>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No members found.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {members.map((member) => {
        const role = member.role || 'Member';
        const name = member.user.myProfile?.username || member.user.email;
        const isSelf = member.user._id === currentUserId;

        return (
          <li
            key={member.user._id}
            className="flex items-center justify-between border p-4 rounded-md"
          >
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>

            {!isSelf && (
              <div className="space-x-2">
                {role === 'Member' && (
                  <form
                    action={`/api/cliqs/${cliqId}/member-actions`}
                    method="POST"
                  >
                    <input type="hidden" name="targetUserId" value={member.user._id} />
                    <input type="hidden" name="action" value="promote" />
                    <Button type="submit" variant="outline">
                      Promote
                    </Button>
                  </form>
                )}

                {role === 'Moderator' && (
                  <form
                    action={`/api/cliqs/${cliqId}/member-actions`}
                    method="POST"
                  >
                    <input type="hidden" name="targetUserId" value={member.user._id} />
                    <input type="hidden" name="action" value="demote" />
                    <Button type="submit" variant="secondary">
                      Demote
                    </Button>
                  </form>
                )}

                <form
                  action={`/api/cliqs/${cliqId}/member-actions`}
                  method="POST"
                >
                  <input type="hidden" name="targetUserId" value={member.user._id} />
                  <input type="hidden" name="action" value="remove" />
                  <Button type="submit" variant="destructive">
                    Remove
                  </Button>
                </form>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
