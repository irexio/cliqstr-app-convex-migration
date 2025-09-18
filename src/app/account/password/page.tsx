import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import PasswordClient from './_client';

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  enforceAPA(user);
  return <PasswordClient userEmail={user.email} />;
}
