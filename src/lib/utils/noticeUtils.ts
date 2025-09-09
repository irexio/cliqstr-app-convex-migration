/**
 * 🧹 Notice Management Utilities (CONVEX VERSION)
 * 
 * Utilities for managing cliq notices:
 * - Notice type validation
 * - Date calculations
 * - Content validation
 * 
 * NOTE: Database operations now handled by Convex functions in convex/cliqNotices.ts
 */

// Database operations moved to Convex functions in convex/cliqNotices.ts

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

// Database operations moved to Convex functions in convex/cliqNotices.ts

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
