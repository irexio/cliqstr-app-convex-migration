import { redirect } from 'next/navigation';

// This page should never render - all logic is in the route handler
export default function InviteAcceptPage() {
  // If someone hits this page directly without going through the route handler,
  // redirect them to the route handler
  redirect('/invite/accept');
}
