export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth/getServerSession';
import ParentSignupModal from '@/components/parents/wizard/ParentSignupModal';
import PermissionsModal from '@/components/parents/wizard/PermissionsModal';
import SuccessSection from '@/components/parents/wizard/SuccessSection';

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
    try {
      const userId = (session as any)?.userId;
      if (userId) {
        account = await prisma.account.findFirst({
          where: { userId: userId }
        });
        
        if (account?.role === 'Parent') {
          // 🎯 Sol's Rule: Check if onboarding is complete
          if ((account as any)?.parentOnboardingComplete === true) {
            initialStep = 'SUCCESS';
          } else if (inviteCode) {
            const invite = await prisma.invite.findFirst({
              where: { code: inviteCode }
            });
            
            if (invite?.status === 'completed') {
              // Invite completed, show success
              initialStep = 'SUCCESS';
            } else if (invite?.status === 'accepted') {
              // Move to permissions step
              initialStep = 'PERMISSIONS';
            } else {
              // Invite not accepted yet, start signup
              initialStep = 'PARENT_SIGNUP';
            }
          } else {
            // No invite, default to success for existing parent
            initialStep = 'SUCCESS';
          }
        } else {
          // Not a parent yet, start signup
          initialStep = 'PARENT_SIGNUP';
        }
      } else {
        // No userId, start signup
        initialStep = 'PARENT_SIGNUP';
      }
    } catch (error) {
      console.error('[PARENTS_HQ] Database error:', error);
      initialStep = 'PARENT_SIGNUP';
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
      {initialStep === 'PARENT_SIGNUP' && <ParentSignupModal prefillEmail={inviteEmail} />}
      {/* TODO: Add other step modals as we build them */}
      {initialStep === 'UPGRADE_TO_PARENT' && <ParentSignupModal prefillEmail={inviteEmail} />}
      {initialStep === 'PARENT_DOB' && <div>Parent DOB Modal (TODO)</div>}
      {initialStep === 'CHILD_CREATE' && <div>Child Create Modal (TODO)</div>}
      {initialStep === 'PERMISSIONS' && <PermissionsModal />}
      {initialStep === 'SUCCESS' && <SuccessSection />}
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
