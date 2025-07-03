// 🔐 APA-HARDENED PAGE: /cliqs/[id]/member-actions

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function MemberActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: cliqId } = await params;

  const user = await getCurrentUser();
  if (!user?.id) notFound();

  const [memberships, cliq] = await Promise.all([
    prisma.membership.findMany({
      where: { cliqId },
      include: {
        user: {
          select: { id: true, email: true, profile: true },
        },
      },
    }),
    prisma.cliq.findUnique({
      where: { id: cliqId },
      select: { ownerId: true },
    }),
  ]);

  if (!cliq || cliq.ownerId !== user.id) {
    return notFound(); // Only the owner may access this page
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Members</h1>

      <ul className="space-y-4">
        {memberships.map((m) => {
          const role = m.role || 'Member';
          const name = m.user.profile?.username || m.user.email;

          const isSelf = m.user.id === user.id;

          return (
            <li
              key={m.user.id}
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
                      <input type="hidden" name="targetUserId" value={m.user.id} />
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
                      <input type="hidden" name="targetUserId" value={m.user.id} />
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
                    <input type="hidden" name="targetUserId" value={m.user.id} />
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
    </main>
  );
}
