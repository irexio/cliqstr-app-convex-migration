/**
 * 🔐 APA-HARDENED HELPER: requireCliqMembership
 * 
 * Purpose:
 *   - Enforces that the current user is an approved member of the specified cliq
 *   - Centralizes membership validation logic across all API routes
 *   - Throws appropriate errors for consistent handling
 * 
 * Usage:
 *   - Import and call this function at the start of any route that accesses cliq data
 *   - Will throw an error if validation fails, which should be caught and returned as 403
 */

import { prisma } from '@/lib/prisma'
import { Membership } from '@prisma/client'

export async function requireCliqMembership(
  userId: string,
  cliqId: string
): Promise<Membership> {
  if (!userId || !cliqId) {
    throw new Error('Missing userId or cliqId')
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      cliqId,
    },
  })

  if (!membership) {
    throw new Error('Not a member of this cliq')
  }

  return membership
}

/**
 * Checks if two users share at least one cliq in common
 * Used for profile visibility and other user-to-user interactions
 * 
 * @param viewerUserId - The ID of the user viewing/accessing
 * @param targetUserId - The ID of the user being viewed/accessed
 * @returns boolean - True if users share at least one cliq
 */
export async function checkSharedCliqMembership(
  viewerUserId: string,
  targetUserId: string
): Promise<boolean> {
  if (!viewerUserId || !targetUserId) {
    return false
  }

  // Find all cliqIds where viewer is a member
  const viewerCliqIds = await prisma.membership.findMany({
    where: { userId: viewerUserId },
    select: { cliqId: true },
  })

  // If viewer has no cliqs, they can't share any
  if (viewerCliqIds.length === 0) {
    return false
  }

  // Check if target user is a member of any of those cliqs
  const sharedMembership = await prisma.membership.findFirst({
    where: {
      userId: targetUserId,
      cliqId: {
        in: viewerCliqIds.map(m => m.cliqId),
      },
    },
  })

  return !!sharedMembership
}
