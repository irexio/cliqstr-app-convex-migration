// 🔐 APA-HARDENED — Server entrypoint for cliq member listing

import CliqMembersContent from '@/components/CliqMembersContent';

interface PageProps {
  params: { id: string };
}

export default function MembersPage({ params }: PageProps) {
  return (
    <CliqMembersContent cliqId={params.id} currentUserId="" />
  );
}
