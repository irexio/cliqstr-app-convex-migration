export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth/getServerSession';
import StreamlinedParentsHQWizard from '@/components/parents/StreamlinedParentsHQWizard';

type WizardStep = 'PARENT_SIGNUP' | 'PARENT_SIGNUP_DOB_ONLY' | 'PLAN_SELECTION' | 'CHILD_CREATE' | 'PERMISSIONS' | 'SUCCESS';

/**
 * 🎯 Sol's Server-Side Parents HQ Page
 * 
 * Smart step detection based on:
 * - Session state (authenticated vs not)
 * - Account state (role, approval, onboarding completion)
 * - Invite context (pending_invite cookie)
 */
export default async function ParentsHQPage() {
  const cookieStore = cookies();
  
  // Get session and invite cookie
  const session = await getServerSession();
  const inviteCode = cookieStore.get('pending_invite')?.value;

  let initialStep: WizardStep;
  let account = null;

  if (!session) {
    // Not authenticated - start with parent signup
    initialStep = 'PARENT_SIGNUP';
  } else {
    // Authenticated - check account state
    try {
      account = await prisma.account.findUnique({
        where: { userId: session.id },
        select: {
          id: true,
          role: true,
          isApproved: true,
          birthdate: true,
          plan: true
        }
      });

      if (!account || account.role !== 'Parent' || !account.isApproved) {
        // Hard fail - shouldn't happen in invite flow
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
              <h2 className="text-red-900 font-semibold mb-2">Access Error</h2>
              <p className="text-red-800 text-sm mb-4">
                This page is only accessible to approved parent accounts.
              </p>
              <a href="/sign-out" className="text-red-600 underline text-sm">
                Sign out and try again
              </a>
            </div>
          </div>
        );
      }

      if (!account.birthdate) {
        // Missing birthdate - collect it first
        initialStep = 'PARENT_SIGNUP_DOB_ONLY';
      } else {
        // For now, always start with plan selection if we have an invite
        // TODO: Add parentOnboardingComplete field to schema
        if (inviteCode) {
          initialStep = 'PLAN_SELECTION';
        } else {
          // No cookie - fallback: find recent invite
          const recentInvite = await findRecentInviteForParent(session.email);
          if (recentInvite) {
            initialStep = 'PLAN_SELECTION';
          } else {
            initialStep = 'CHILD_CREATE';
          }
        }
      }
    } catch (error) {
      console.error('[PARENTS_HQ] Database error:', error);
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <h2 className="text-red-900 font-semibold mb-2">System Error</h2>
            <p className="text-red-800 text-sm">
              Unable to load your account information. Please try again.
            </p>
          </div>
        </div>
      );
    }
  }

  // For now, pass the step as a URL parameter to the existing wizard
  // TODO: Refactor wizard to accept server-side props
  return <StreamlinedParentsHQWizard />;
}

/**
 * Find recent accepted invite for parent email (fallback when no cookie)
 */
async function findRecentInviteForParent(email: string): Promise<any> {
  try {
    const invite = await prisma.invite.findFirst({
      where: {
        inviteeEmail: email.toLowerCase(),
        status: 'accepted'
      },
      orderBy: { createdAt: 'desc' }
    });
    return invite;
  } catch {
    return null;
  }
}
