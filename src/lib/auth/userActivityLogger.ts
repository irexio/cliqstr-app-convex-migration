/**
 * 🔐 APA-SAFE — User Activity Logger
 * 
 * Centralized logging for user activities like signup, login, invite acceptance
 * Helps track user flows and debug authentication issues
 */

import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface LogActivityParams {
  userId?: string;
  event: 'signup' | 'login' | 'invite-accept' | 'logout' | 'password-reset' | 'email-verify';
  detail?: string;
  debugId?: string;
  req?: NextRequest;
}

/**
 * Log user activity with optional IP tracking and debug info
 */
export async function logUserActivity({
  userId,
  event,
  detail,
  debugId,
  req
}: LogActivityParams) {
  try {
    // Extract IP from request headers if available
    let ipAddress: string | undefined;
    if (req) {
      ipAddress = 
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        req.headers.get('cf-connecting-ip') ||
        undefined;
      
      // Clean up IP (take first if comma-separated)
      if (ipAddress) {
        ipAddress = ipAddress.split(',')[0].trim();
      }
    }

    // Build detail string with IP if available
    let fullDetail = detail || '';
    if (ipAddress) {
      fullDetail = fullDetail ? `${fullDetail} | IP: ${ipAddress}` : `IP: ${ipAddress}`;
    }

    // Log to database
    const activityLog = await prisma.userActivityLog.create({
      data: {
        userId,
        event,
        detail: fullDetail || null,
        debugId: debugId || null,
      }
    });

    console.log(`[USER_ACTIVITY] ${event} logged for user ${userId || 'anonymous'} - ${activityLog.id}`);
    
    return { success: true, logId: activityLog.id };
  } catch (error) {
    console.error(`[USER_ACTIVITY] Failed to log ${event} for user ${userId}:`, error);
    return { success: false, error };
  }
}

/**
 * Log signup activity with invite context
 */
export async function logSignup(userId: string, inviteCode?: string, req?: NextRequest) {
  const detail = inviteCode ? `Signup via invite: ${inviteCode}` : 'Direct signup';
  return logUserActivity({
    userId,
    event: 'signup',
    detail,
    req
  });
}

/**
 * Log login activity
 */
export async function logLogin(userId: string, req?: NextRequest) {
  return logUserActivity({
    userId,
    event: 'login',
    detail: 'User login',
    req
  });
}

/**
 * Log invite acceptance
 */
export async function logInviteAccept(userId: string, inviteCode: string, method: 'link' | 'manual' = 'link', req?: NextRequest) {
  const detail = `Invite accepted: ${inviteCode} (${method})`;
  return logUserActivity({
    userId,
    event: 'invite-accept',
    detail,
    req
  });
}
