// 🔐 APA-HARDENED PAGE: /cliqs/[id]/members
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function MembersPage({
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

  if (!cliq) notFound();

  const isOwner = cliq.ownerId === user.id;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cliq Members</h1>

      <ul className="space-y-4">
        {memberships.map((m) => {
          const role = m.role || 'Member';
          const name = m.user.profile?.username || m.user.email;

          return (
            <li
              key={m.user.id}
              className="flex items-center justify-between border p-4 rounded-md"
            >
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>

              {isOwner && m.user.id !== user.id && (
                <div className="space-x-2">
                  {role === 'Member' && (
                    <form
                      action={`/api/cliqs/${cliqId}/member-actions`}
                      method="POST"
                    >
                      <input type="hidden" name="targetUserId" value={m.user.id} />
                      <input type="hidden" name="action" value="promote" />
                      <Button type="submit" variant="outline">
                        Promote to Moderator
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
    </main>
  );
}
