import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import EmailClient from './_client';

export default async function ChangeEmailPage() {
  const user = await getCurrentUser();
  enforceAPA(user);
  return <EmailClient currentEmail={user.email} />;
}
