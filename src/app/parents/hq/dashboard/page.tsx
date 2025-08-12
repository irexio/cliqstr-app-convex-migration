export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED COMPONENT: Parents HQ Dashboard
 * 
 * Purpose:
 *   - Success page after child account creation
 *   - Overview of managed children
 *   - Quick access to child management features
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';

async function getParentData() {
  // This would normally fetch from your auth system
  // For now, we'll redirect to the main dashboard
  return null;
}

export default async function ParentsHQDashboard() {
  // For now, redirect to the main dashboard
  // Later we can build a dedicated parent dashboard here
  redirect('/my-cliqs-dashboard');
}
