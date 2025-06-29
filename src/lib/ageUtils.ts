// lib/ageUtils.ts

/**
 * Given a birthdate string (YYYY-MM-DD), returns the age group label.
 */
export function getAgeGroup(birthdate: string): string {
  const age = Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  if (age < 8) return 'child';
  if (age < 13) return 'tween';
  if (age < 18) return 'teen';
  if (age < 65) return 'adult';
  return 'senior';
}
