export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/getServerSession';
import { prisma } from '@/lib/prisma';
import ParentsHQWithSignup from '@/components/parents/ParentsHQWithSignup';

/**
 * 🎯 Mimi's Vision: Beautiful Parents HQ with signup at the top
 * 
 * Shows signup form at top when needed, then beautiful dashboard below
 */
export default async function ParentsHQPage() {
  const cookieStore = cookies();
  
  // Get session and invite cookie
  const session = await getServerSession();
  const pendingInviteCookie = cookieStore.get('pending_invite')?.value;
  
  let needsSignup = false;
  let needsChildCreation = false;
  let needsPermissions = false;
  let needsUpgradeToParent = false;
  let account = null;
  let invite = null;

  // Parse invite cookie to get inviteId
  let inviteId = null;
  if (pendingInviteCookie) {
    try {
      const parsed = JSON.parse(pendingInviteCookie);
      inviteId = parsed.inviteId;
    } catch (e) {
      console.error('[PARENTS_HQ] Invalid pending_invite cookie:', e);
    }
  }

  // Get invite details if we have an inviteId
  if (inviteId) {
    try {
      invite = await prisma.invite.findUnique({
        where: { id: inviteId },
        select: {
          id: true,
          targetState: true,
          targetUserId: true,
          targetEmailNormalized: true,
          inviteeEmail: true,
          status: true,
          used: true
        }
      });
    } catch (error) {
      console.error('[PARENTS_HQ] Error fetching invite:', error);
    }
  }

  // 🎯 Determine what the user needs to see based on session and invite targetState
  if (!session) {
    if (invite?.targetState === 'existing_parent' || invite?.targetState === 'existing_user_non_parent') {
      // Existing user needs to sign in first - redirect to sign-in page
      redirect('/sign-in?redirect=' + encodeURIComponent('/parents/hq'));
    } else {
      // New user (targetState === 'new' or no targetState) needs to sign up
      needsSignup = true;
    }
  } else {
    try {
      const userId = (session as any)?.userId;
      if (userId) {
        account = await prisma.account.findFirst({
          where: { userId: userId }
        });
        
        if (account?.role === 'Parent') {
          // Parent is authenticated - determine next step based on invite
          if (invite) {
            if (invite.status === 'pending' && !invite.used) {
              // Check if child account exists for this invite
              const childExists = invite.targetUserId ? await prisma.user.findFirst({
                where: { id: invite.targetUserId },
                include: { account: true }
              }) : null;
              
              if (!childExists || childExists.account?.role !== 'Child') {
                needsChildCreation = true;
              } else {
                needsPermissions = true;
              }
            }
          }
        } else if (account?.role && account.role !== 'Parent') {
          // Existing user but not Parent - needs upgrade
          needsUpgradeToParent = true;
        } else {
          // No account or invalid role - needs signup
          needsSignup = true;
        }
      } else {
        needsSignup = true;
      }
    } catch (error) {
      console.error('[PARENTS_HQ] Error checking account:', error);
      needsSignup = true;
    }
  }

  // Extract email from invite if available
  let prefillEmail = '';
  if (invite) {
    prefillEmail = invite.inviteeEmail || '';
  }

  return (
    <ParentsHQWithSignup 
      needsSignup={needsSignup}
      needsChildCreation={needsChildCreation}
      needsPermissions={needsPermissions}
      needsUpgradeToParent={needsUpgradeToParent}
      prefillEmail={prefillEmail}
      inviteId={inviteId}
      targetState={invite?.targetState}
    />
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
