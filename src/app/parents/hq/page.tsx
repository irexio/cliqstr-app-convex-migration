export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
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
  const inviteCode = cookieStore.get('pending_invite')?.value;

  let needsSignup = false;
  let needsChildCreation = false;
  let needsPermissions = false;
  let account = null;

  // 🎯 Determine what the user needs to see
  if (!session) {
    needsSignup = true;
  } else {
    try {
      const userId = (session as any)?.userId;
      if (userId) {
        account = await prisma.account.findFirst({
          where: { userId: userId }
        });
        
        if (account?.role === 'Parent') {
          // Check if we need permissions step
          if (inviteCode) {
            const invite = await prisma.invite.findFirst({
              where: { 
                code: inviteCode,
                expiresAt: { gt: new Date() }
              }
            });
            
            const isValidInvite = invite && 
              ['pending', 'accepted'].includes(invite.status) &&
              (!invite.invitedUserId || invite.invitedUserId === userId);
            
            if (isValidInvite && invite.status === 'accepted' && !invite.used) {
              // Check if child account exists for this invite
              const childExists = await prisma.user.findFirst({
                where: { 
                  id: invite.invitedUserId || '' 
                },
                include: { account: true }
              });
              
              if (!childExists || childExists.account?.role !== 'Child') {
                needsChildCreation = true;
              } else {
                needsPermissions = true;
              }
            }
          }
        } else {
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
  if (inviteCode) {
    try {
      const invite = await prisma.invite.findFirst({
        where: { code: inviteCode },
        select: { inviteeEmail: true }
      });
      prefillEmail = invite?.inviteeEmail || '';
    } catch (error) {
      console.error('[PARENTS_HQ] Error getting invite email:', error);
    }
  }

  return (
    <ParentsHQWithSignup 
      needsSignup={needsSignup}
      needsChildCreation={needsChildCreation}
      needsPermissions={needsPermissions}
      prefillEmail={prefillEmail}
      inviteCode={inviteCode}
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
