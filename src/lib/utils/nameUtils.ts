/**
 * 🔐 APA-SAFE — Name Resolution Utilities
 * 
 * Consistent name display logic across the application
 */

interface UserProfile {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}

interface UserWithProfile {
  email: string;
  myProfile?: UserProfile | null;
}

/**
 * Resolve display name with proper fallback hierarchy:
 * 1. firstName + lastName (if both available)
 * 2. username (if available)
 * 3. email (fallback)
 */
export function resolveDisplayName(user: UserWithProfile): string {
  const profile = user.myProfile;
  
  // Priority 1: First + Last name
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  
  // Priority 2: Username
  if (profile?.username) {
    return profile.username;
  }
  
  // Priority 3: Email fallback
  return user.email;
}

/**
 * Get user initials for avatars
 */
export function getUserInitials(user: UserWithProfile): string {
  const profile = user.myProfile;
  
  // Use first letter of firstName + lastName if available
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  }
  
  // Use first two letters of username
  if (profile?.username && profile.username.length >= 2) {
    return profile.username.substring(0, 2).toUpperCase();
  }
  
  // Use first two letters of email
  return user.email.substring(0, 2).toUpperCase();
}

/**
 * Get short display name (first name or username)
 */
export function getShortDisplayName(user: UserWithProfile): string {
  const profile = user.myProfile;
  
  // Priority 1: First name only
  if (profile?.firstName) {
    return profile.firstName;
  }
  
  // Priority 2: Username
  if (profile?.username) {
    return profile.username;
  }
  
  // Priority 3: Email prefix
  return user.email.split('@')[0];
}
