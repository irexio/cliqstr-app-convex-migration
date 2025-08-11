export const dynamic = 'force-dynamic';

import ParentsHQWizard from '@/components/parents/ParentsHQWizard';
import ParentsHQContent from '@/components/parents/ParentsHQContent';

export default async function Page({ searchParams }: { searchParams: { inviteCode?: string } }) {
  const inviteCode = searchParams.inviteCode;
  
  // If there's an invite code, use the original flow for child invite approval
  if (inviteCode) {
    return <ParentsHQContent />;
  }
  
  // Otherwise, use the new wizard for parent account setup and child creation
  return <ParentsHQWizard />;
}
