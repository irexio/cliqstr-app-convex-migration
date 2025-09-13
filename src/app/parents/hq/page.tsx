export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED COMPONENT: Parents HQ
 * 
 * Purpose:
 *   - Main entry point for all parent-related functionality
 *   - Handles both child invite approval and ongoing child management
 *   - Uses the existing ParentsHQContent component
 */

import ParentsHQContent from '@/components/parents/ParentsHQContent';

export default async function ParentsHQ() {
  return <ParentsHQContent />;
}
