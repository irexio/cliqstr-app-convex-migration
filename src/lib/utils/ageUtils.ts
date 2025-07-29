/**
 * 🎂 Age Calculation Utilities (APA-Safe)
 * 
 * These utilities calculate user age from Account.birthdate (immutable)
 * for age gating and parental control enforcement.
 * 
 * ⚠️ SECURITY: Always use Account.birthdate, never MyProfile.birthdate
 */

/**
 * Calculate user's current age from their birthdate
 * @param birthdate - User's birthdate from Account model (immutable)
 * @returns Current age in years
 */
export function calculateAge(birthdate: Date | string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Check if user meets age requirements for a cliq
 * @param userBirthdate - User's birthdate from Account model
 * @param minAge - Minimum age requirement (optional)
 * @param maxAge - Maximum age requirement (optional)
 * @returns Object with validation result and details
 */
export function validateAgeRequirements(
  userBirthdate: Date | string,
  minAge?: number | null,
  maxAge?: number | null
): {
  isValid: boolean;
  userAge: number;
  reason?: string;
} {
  const userAge = calculateAge(userBirthdate);
  
  // Check minimum age requirement
  if (minAge && userAge < minAge) {
    return {
      isValid: false,
      userAge,
      reason: `Must be at least ${minAge} years old. You are ${userAge}.`
    };
  }
  
  // Check maximum age requirement
  if (maxAge && userAge > maxAge) {
    return {
      isValid: false,
      userAge,
      reason: `Must be ${maxAge} years old or younger. You are ${userAge}.`
    };
  }
  
  return {
    isValid: true,
    userAge
  };
}

/**
 * Get age group classification for display purposes
 * @param birthdate - User's birthdate from Account model
 * @returns Age group string
 */
export function getAgeGroup(birthdate: Date | string): string {
  const age = calculateAge(birthdate);
  
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  if (age < 25) return 'young-adult';
  if (age < 40) return 'adult';
  if (age < 60) return 'middle-aged';
  return 'senior';
}

/**
 * Check if user is a minor (under 18)
 * @param birthdate - User's birthdate from Account model
 * @returns True if user is under 18
 */
export function isMinor(birthdate: Date | string): boolean {
  return calculateAge(birthdate) < 18;
}

/**
 * Generate age range display string for cliq cards
 * @param minAge - Minimum age (optional)
 * @param maxAge - Maximum age (optional)
 * @returns Formatted age range string
 */
export function formatAgeRange(minAge?: number | null, maxAge?: number | null): string {
  if (!minAge && !maxAge) return 'All ages';
  if (minAge && !maxAge) return `${minAge}+`;
  if (!minAge && maxAge) return `Up to ${maxAge}`;
  return `${minAge}-${maxAge}`;
}

/**
 * 🧪 Test data for development
 */
export const TEST_BIRTHDATES = {
  child: new Date('2015-01-01'),    // ~9 years old
  teen: new Date('2010-01-01'),     // ~14 years old
  youngAdult: new Date('2000-01-01'), // ~24 years old
  adult: new Date('1985-01-01'),    // ~39 years old
  senior: new Date('1960-01-01')    // ~64 years old
} as const;
