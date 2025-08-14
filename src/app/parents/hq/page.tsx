export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth/getServerSession';
// import ParentSignupModal from '@/components/parents/wizard/ParentSignupModal';

type WizardStep = 'PARENT_SIGNUP' | 'UPGRADE_TO_PARENT' | 'PARENT_DOB' | 'CHILD_CREATE' | 'PERMISSIONS' | 'SUCCESS';

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

  // 🎯 SOL'S EXACT STEP DETECTION LOGIC
  if (!session) {
    // No user - start with parent signup
    initialStep = 'PARENT_SIGNUP';
  } else {
    // User exists - check account state
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

      if (!account?.isApproved || account.role !== 'Parent') {
        // Auto-approve path for invite (Sol's UPGRADE_TO_PARENT step)
        initialStep = 'UPGRADE_TO_PARENT';
      } else if (!account.birthdate) {
        // Missing birthdate - collect it
        initialStep = 'PARENT_DOB';
      } else if (inviteCode && !(await childCreatedForInvite(inviteCode))) {
        // Has invite, no child created yet
        initialStep = 'CHILD_CREATE';
      } else if (inviteCode && !(await permissionsCompleted(inviteCode))) {
        // Has invite, child created, permissions incomplete
        initialStep = 'PERMISSIONS';
      } else {
        // Everything complete
        initialStep = 'SUCCESS';
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

  // 🎯 Sol's Direct Modal Rendering - Ultra Clean
  const inviteEmail = ''; // TODO: Extract from invite if needed
  
  return (
    <>
      {/* 🚨 DEBUG: Confirm this page is being served */}
      <div style={{position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', padding: '5px', zIndex: 9999}}>
        DEBUG: Parents HQ Page - Step: {initialStep} - Cookie: {inviteCode || 'none'}
      </div>
      
      {/* Page chrome - minimal */}
      {initialStep === 'PARENT_SIGNUP' && <div style={{background: 'blue', color: 'white', padding: '20px'}}>PARENT_SIGNUP STEP - Modal would go here</div>}
      {/* TODO: Add other step modals as we build them */}
      {initialStep === 'UPGRADE_TO_PARENT' && <div style={{background: 'green', color: 'white', padding: '20px'}}>UPGRADE_TO_PARENT STEP</div>}
      {initialStep === 'PARENT_DOB' && <div>Parent DOB Modal (TODO)</div>}
      {initialStep === 'CHILD_CREATE' && <div>Child Create Modal (TODO)</div>}
      {initialStep === 'PERMISSIONS' && <div>Permissions Modal (TODO)</div>}
      {initialStep === 'SUCCESS' && <div>Success Page (TODO)</div>}
    </>
  );
}

/**
 * 🎯 Sol's Helper Functions for Step Detection
 */

/**
 * Check if child has been created for this invite
 */
async function childCreatedForInvite(inviteCode: string): Promise<boolean> {
  try {
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
      select: { 
        invitedUserId: true,
        status: true
      }
    });
    
    // If invite has invitedUserId and is accepted, child was created
    return invite?.invitedUserId !== null && invite?.status === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Check if permissions have been completed for this invite
 */
async function permissionsCompleted(inviteCode: string): Promise<boolean> {
  try {
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
      select: { 
        used: true,
        status: true
      }
    });
    
    // If invite is used and accepted, permissions are complete
    return invite?.used === true && invite?.status === 'accepted';
  } catch {
    return false;
  }
}
