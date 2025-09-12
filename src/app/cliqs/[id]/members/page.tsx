'use client';

// 🔐 APA-HARDENED PAGE: /cliqs/[id]/members
// 🔄 CONVEX-OPTIMIZED: Now uses Convex for real-time updates

import { useAuth } from '@/lib/auth/useAuth';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, isLoading } = useAuth();
  
  // Get cliq members using Convex
  const members = useQuery(api.cliqs.getCliqMembers, 
    user?.id ? { cliqId: id as Id<"cliqs"> } : "skip"
  );

  // Get cliq info to check ownership
  const cliq = useQuery(api.cliqs.getCliq, 
    user?.id ? { 
      cliqId: id as Id<"cliqs">, 
      userId: user.id as Id<"users"> 
    } : "skip"
  );

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!user?.id) {
    notFound();
  }

  if (cliq === null) {
    notFound();
  }

  if (cliq === undefined || members === undefined) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading members...</p>
        </div>
      </main>
    );
  }

  const isOwner = cliq.ownerId === user.id;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cliq Members</h1>

      {!members || members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No members found.
        </div>
      ) : (
        <ul className="space-y-4">
          {members.filter(member => member !== null).map((member) => {
            const role = member.role || 'Member';
            const name = member.profile ? 
              `${member.profile.firstName || ''} ${member.profile.lastName || ''}`.trim() || 
              member.profile.username : 
              'Unknown';

            return (
              <li
                key={member.id}
                className="flex items-center justify-between border p-4 rounded-md"
              >
                <div className="flex items-center gap-4">
                  <UserAvatar 
                    image={member.profile?.image}
                    name={name}
                    userId={member.id}
                    size="md"
                  />
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {isOwner && member.id !== user.id && (
                  <div className="space-x-2">
                    {role === 'Member' && (
                      <form
                        action={`/api/cliqs/${id}/member-actions`}
                        method="POST"
                      >
                        <input type="hidden" name="targetUserId" value={member.id} />
                        <input type="hidden" name="action" value="promote" />
                        <Button type="submit" variant="outline">
                          Promote to Moderator
                        </Button>
                      </form>
                    )}
                    {role === 'Moderator' && (
                      <form
                        action={`/api/cliqs/${id}/member-actions`}
                        method="POST"
                      >
                        <input type="hidden" name="targetUserId" value={member.id} />
                        <input type="hidden" name="action" value="demote" />
                        <Button type="submit" variant="secondary">
                          Demote to Member
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}