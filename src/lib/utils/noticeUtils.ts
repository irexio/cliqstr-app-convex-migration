/**
 * 🧹 Notice Management Utilities
 * 
 * Utilities for managing cliq notices:
 * - Cleanup expired notices
 * - Generate birthday notices
 * - Notice type validation
 */

import { prisma } from '@/lib/prisma';

/**
 * Clean up expired notices from the database
 * Should be run periodically (e.g., daily cron job)
 */
export async function cleanupExpiredNotices() {
  try {
    const now = new Date();
    
    const result = await prisma.cliqNotice.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    console.log(`[NOTICE_CLEANUP] Removed ${result.count} expired notices`);
    return result.count;
  } catch (error) {
    console.error('[NOTICE_CLEANUP_ERROR]', error);
    return 0;
  }
}

/**
 * Get notice type display information
 */
export function getNoticeTypeInfo(type: string) {
  switch (type) {
    case 'birthday':
      return {
        icon: '🎉',
        label: 'Birthday',
        priority: 2,
        autoExpires: true,
        expiryDays: 7
      };
    case 'admin':
      return {
        icon: '🗓️',
        label: 'Announcement',
        priority: 3,
        autoExpires: false,
        expiryDays: null
      };
    case 'red_alert_open':
      return {
        icon: '⚠️',
        label: 'Safety Alert',
        priority: 1, // Highest priority
        autoExpires: false,
        expiryDays: null
      };
    case 'red_alert_resolved':
      return {
        icon: '✅',
        label: 'Alert Resolved',
        priority: 2,
        autoExpires: true,
        expiryDays: 7
      };
    default:
      return {
        icon: '📢',
        label: 'Notice',
        priority: 4,
        autoExpires: false,
        expiryDays: null
      };
  }
}

/**
 * Calculate the end of week (Sunday 23:59:59.999) for a given date
 */
export function getEndOfWeek(date: Date = new Date()) {
  const endOfWeek = new Date(date);
  const daysUntilSunday = (7 - date.getDay()) % 7;
  endOfWeek.setDate(date.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

/**
 * Create a birthday notice for a specific user
 */
export async function createBirthdayNotice(cliqId: string, username: string) {
  try {
    // Set expiry to end of current week
    const endOfWeek = getEndOfWeek();

    const notice = await prisma.cliqNotice.create({
      data: {
        cliqId,
        type: 'birthday',
        content: `🎉 This week is ${username}'s birthday! Drop them some birthday wishes in the cliq.`,
        expiresAt: endOfWeek
      }
    });

    console.log(`[BIRTHDAY_NOTICE] Created birthday notice for ${username} in cliq ${cliqId}`);
    return notice;
  } catch (error) {
    console.error('[BIRTHDAY_NOTICE_ERROR]', error);
    return null;
  }
}

/**
 * Check if a birthday notice already exists for a user this week
 */
export async function birthdayNoticeExists(cliqId: string, username: string) {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const notice = await prisma.cliqNotice.findFirst({
      where: {
        cliqId,
        type: 'birthday',
        content: {
          contains: username
        },
        createdAt: {
          gte: startOfWeek
        }
      }
    });

    return !!notice;
  } catch (error) {
    console.error('[BIRTHDAY_CHECK_ERROR]', error);
    return false;
  }
}

/**
 * Get active notice count for a cliq
 */
export async function getActiveNoticeCount(cliqId: string) {
  try {
    const now = new Date();
    
    const count = await prisma.cliqNotice.count({
      where: {
        cliqId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    });

    return count;
  } catch (error) {
    console.error('[NOTICE_COUNT_ERROR]', error);
    return 0;
  }
}

/**
 * Validate notice content
 */
export function validateNoticeContent(content: string, type: string) {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('Notice content cannot be empty');
  }

  if (content.length > 500) {
    errors.push('Notice content cannot exceed 500 characters');
  }

  // Type-specific validation
  if (type === 'admin') {
    if (content.length < 10) {
      errors.push('Admin notices should be at least 10 characters long');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Notice type constants
 */
export const NOTICE_TYPES = {
  BIRTHDAY: 'birthday',
  ADMIN: 'admin',
  RED_ALERT_OPEN: 'red_alert_open',
  RED_ALERT_RESOLVED: 'red_alert_resolved'
} as const;

export type NoticeType = typeof NOTICE_TYPES[keyof typeof NOTICE_TYPES];
