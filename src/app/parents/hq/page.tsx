export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth/session-config';
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

  // Prefer inviteId from secure iron-session; fallback to legacy pending_invite cookie
  let inviteId: string | null = null;
  try {
    const request = new NextRequest('http://localhost', {
      headers: { cookie: cookieStore.toString() },
    });
    const response = NextResponse.next();
    const iron = await getIronSession<any>(request, response, sessionOptions);
    if (iron?.inviteId) {
      inviteId = iron.inviteId as string;
      console.log('[PARENTS_HQ] inviteId from iron-session:', inviteId);
    }
  } catch (e) {
    console.error('[PARENTS_HQ] Error reading iron-session for inviteId:', e);
  }

  // Legacy: Parse invite cookie to get inviteId (handle both Base64-URL and legacy JSON formats)
  if (pendingInviteCookie) {
    try {
      console.log('[PARENTS_HQ] Raw pending_invite cookie:', pendingInviteCookie);
      
      // Try Base64-URL format first
      try {
        if (!inviteId) {
          const decodedJson = Buffer.from(pendingInviteCookie, 'base64url').toString('utf-8');
          const parsed = JSON.parse(decodedJson);
          inviteId = parsed.inviteId;
          console.log('[PARENTS_HQ] Parsed inviteId (Base64-URL):', inviteId);
        }
      } catch (base64Error) {
        // Fallback to legacy JSON format
        console.log('[PARENTS_HQ] Base64-URL decode failed, trying legacy JSON format');
        if (!inviteId) {
          const parsed = JSON.parse(decodeURIComponent(pendingInviteCookie));
          inviteId = parsed.inviteId;
          console.log('[PARENTS_HQ] Parsed inviteId (legacy JSON):', inviteId);
        }
      }
    } catch (e) {
      console.error('[PARENTS_HQ] Invalid pending_invite cookie:', e);
    }
  } else {
    console.log('[PARENTS_HQ] No pending_invite cookie found');
  }

  // Get invite details if we have an inviteId
  if (inviteId) {
    try {
      invite = await prisma.invite.findUnique({
        where: { id: inviteId },
        select: {
          id: true,
          code: true,
          cliqId: true,
          targetState: true,
          targetUserId: true,
          invitedUserId: true,
          targetEmailNormalized: true,
          inviteeEmail: true,
          trustedAdultContact: true,
          status: true,
          used: true,
          friendFirstName: true,
          friendLastName: true,
          inviteType: true
        }
      });
      console.log('[PARENTS_HQ] Invite details:', {
        inviteId,
        targetState: invite?.targetState,
        targetUserId: invite?.targetUserId,
        inviteeEmail: invite?.inviteeEmail,
        hasSession: !!session,
        rawCookie: pendingInviteCookie
      });
      
      // If invite not found, log the issue
      if (!invite) {
        console.error('[PARENTS_HQ] No invite found for inviteId:', inviteId);
      }
    } catch (error) {
      console.error('[PARENTS_HQ] Database error fetching invite:', {
        inviteId,
        error: error instanceof Error ? error.message : String(error),
        code: error instanceof Error && 'code' in error ? error.code : 'unknown'
      });
      // Don't throw - continue with null invite to show error state
    }
  }

  // 🎯 Determine what the user needs to see based on session and invite targetState
  if (!session) {
    console.log('[PARENTS_HQ] No session - checking targetState:', invite?.targetState);
    if (invite?.targetState === 'existing_parent' || invite?.targetState === 'existing_user_non_parent') {
      // Existing user needs to sign in first - redirect to sign-in page
      console.log('[PARENTS_HQ] Redirecting existing user to sign-in');
      redirect('/sign-in?redirect=' + encodeURIComponent('/parents/hq'));
    } else {
      // New user (targetState === 'new' or no targetState) needs to sign up
      console.log('[PARENTS_HQ] New user - showing signup form');
      needsSignup = true;
    }
  } else {
    try {
      const userId = (session as any)?.id ?? (session as any)?.userId;
      if (userId) {
        account = await prisma.account.findFirst({
          where: { userId: userId }
        });
        
        if (account?.role === 'Parent') {
          console.log('[PARENTS_HQ] Parent authenticated, checking next step:', {
            hasInvite: !!invite,
            inviteStatus: invite?.status,
            inviteUsed: invite?.used,
            inviteType: invite?.inviteType,
            targetUserId: invite?.targetUserId
          });
          
          // Parent is authenticated - determine next step based on invite
          if (invite && invite.inviteType === 'child') {
            if (invite.status === 'pending' && !invite.used) {
              // For child invites, invitedUserId should be the child's ID (set during child creation)
              // If it's not set yet, we need to create the child
              if (!invite.invitedUserId) {
                console.log('[PARENTS_HQ] Child invite pending, no child created yet - setting needsChildCreation = true');
                needsChildCreation = true;
              } else {
                // Check if the invitedUser is actually a child
                const childExists = await prisma.user.findFirst({
                  where: { id: invite.invitedUserId },
                  include: { account: true }
                });
                
                console.log('[PARENTS_HQ] Child exists check:', {
                  invitedUserId: invite.invitedUserId,
                  childExists: !!childExists,
                  childRole: childExists?.account?.role
                });
                
                if (!childExists || childExists.account?.role !== 'Child') {
                  console.log('[PARENTS_HQ] InvitedUser is not a child, setting needsChildCreation = true');
                  needsChildCreation = true;
                } else {
                  console.log('[PARENTS_HQ] Child already exists, setting needsPermissions = true');
                  needsPermissions = true;
                }
              }
            } else {
              console.log('[PARENTS_HQ] Invite already used or not pending, no child creation needed');
            }
          } else if (!invite) {
            console.log('[PARENTS_HQ] No invite found after parent auth - showing dashboard');
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
  // For child invites, use trustedAdultContact (parent email)
  // For adult invites, use inviteeEmail
  let prefillEmail = '';
  if (invite) {
    if (invite.inviteType === 'child') {
      prefillEmail = invite.trustedAdultContact || '';
    } else {
      prefillEmail = invite.inviteeEmail || '';
    }
    console.log('[PARENTS_HQ] Using prefillEmail from invite:', {
      inviteId: invite.id,
      inviteType: invite.inviteType,
      prefillEmail,
      inviteeEmail: invite.inviteeEmail,
      trustedAdultContact: invite.trustedAdultContact
    });
  } else {
    console.log('[PARENTS_HQ] No invite found - empty prefillEmail');
  }

  return (
    <ParentsHQWithSignup 
      needsSignup={needsSignup}
      needsChildCreation={needsChildCreation}
      needsPermissions={needsPermissions}
      needsUpgradeToParent={needsUpgradeToParent}
      prefillEmail={prefillEmail}
      inviteId={inviteId || undefined}
      inviteCode={invite?.code || undefined}
      targetState={invite?.targetState}
      friendFirstName={invite?.friendFirstName || undefined}
      friendLastName={invite?.friendLastName || undefined}
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
