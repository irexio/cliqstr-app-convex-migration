/**
 * 🔐 Safely calculates age and age group from a birthdate string (YYYY-MM-DD).
 * Returns an object with:
 *   - `age`: the numeric age (or null if invalid)
 *   - `group`: one of: 'child', 'tween', 'teen', 'adult', 'senior', or 'unknown'
 *
 * Used for APA-compliant age categorization.
 */

export function getAgeGroup(birthdate: string): { age: number | null; group: string } {
  if (!birthdate || isNaN(new Date(birthdate).getTime())) {
    return { age: null, group: 'unknown' };
  }

  const age = Math.floor(
    (Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  if (age < 8) return { age, group: 'child' };
  if (age < 13) return { age, group: 'tween' };
  if (age < 18) return { age, group: 'teen' };
  if (age < 65) return { age, group: 'adult' };
  return { age, group: 'senior' };
}
