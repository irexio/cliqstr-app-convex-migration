// Centralized plan validation utility for Cliqstr

export const ALLOWED_PLANS = [
  'basic',
  'premium',
  'family',
  'group',
  'test',
  'free', // if 'free' is a valid plan in your flows
];

export function isValidPlan(plan: string): boolean {
  return ALLOWED_PLANS.includes(plan);
}
