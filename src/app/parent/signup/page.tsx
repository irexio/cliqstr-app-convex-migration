import { redirect } from 'next/navigation';

export default async function ParentSignupRedirect({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  
  // Server-side redirect to new Parents HQ wizard
  const targetUrl = code 
    ? `/parents/hq?inviteCode=${encodeURIComponent(code)}`
    : '/parents/hq';
  
  redirect(targetUrl);
}
