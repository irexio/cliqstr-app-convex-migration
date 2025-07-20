/**
 * 🔐 APA-HARDENED — Branded Invite Code Generator
 * 
 * Purpose:
 *   - Generates human-friendly, branded invite codes in format: cliq-xxxxx
 *   - Uses lowercase letters and numbers only (APA-safe)
 *   - Ensures uniqueness by checking against database
 * 
 * Format: cliq-[5 characters]
 * Characters: lowercase letters (a-z) + numbers (0-9)
 * 
 * Examples:
 *   - cliq-a3x7z
 *   - cliq-m9k2p
 *   - cliq-7b4n1
 */

import { customAlphabet } from 'nanoid';
import { prisma } from '@/lib/prisma';

// APA-safe alphabet: lowercase letters + numbers only
const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const generateCodeSuffix = customAlphabet(alphabet, 5);

/**
 * Generates a unique branded invite code with format: cliq-xxxxx
 * 
 * @returns Promise<string> - A unique invite code like "cliq-a3x7z"
 */
export async function generateInviteCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const suffix = generateCodeSuffix();
    const code = `cliq-${suffix}`;
    
    // Check if this code already exists in the database
    const existingInvite = await prisma.invite.findUnique({
      where: { code },
      select: { id: true }
    });
    
    if (!existingInvite) {
      return code;
    }
    
    attempts++;
  }
  
  // If we couldn't generate a unique code after max attempts, 
  // fall back to a longer suffix
  const longSuffix = customAlphabet(alphabet, 8)();
  return `cliq-${longSuffix}`;
}

/**
 * Validates that an invite code follows the expected format
 * 
 * @param code - The invite code to validate
 * @returns boolean - True if the code follows the cliq-xxxxx format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Must start with "cliq-" and have at least 5 additional characters
  const regex = /^cliq-[a-z0-9]{5,}$/;
  return regex.test(code.toLowerCase());
}

/**
 * Normalizes an invite code to lowercase for consistent database lookups
 * 
 * @param code - The invite code to normalize
 * @returns string - The normalized lowercase code
 */
export function normalizeInviteCode(code: string): string {
  return code.toLowerCase().trim();
}
