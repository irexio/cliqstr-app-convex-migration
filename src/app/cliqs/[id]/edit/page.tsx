import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import EditCliqClient from './_client';

export default async function EditCliqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  enforceAPA(user);
  return <EditCliqClient cliqId={id} currentUserId={user!.id} />;
}