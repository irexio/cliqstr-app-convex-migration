export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED COMPONENT: Parents HQ Dashboard
 * 
 * Purpose:
 *   - Dashboard view for parents after plan selection
 *   - Handles approval token for child signup completion
 *   - Shows parent management interface
 */

import ParentsHQContent from '@/components/parents/ParentsHQContent';

export default async function ParentsHQDashboard() {
  return <ParentsHQContent />;
}
