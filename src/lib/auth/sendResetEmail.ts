/**
 * Sends a password reset email to the specified user
 * TODO: Replace with actual email sending implementation
 */
export async function sendResetEmail(email: string, resetToken: string) {
  // For now, just log that we would send an email
  // In production, this would connect to an email service
  console.log(`[MOCK] Password reset email would be sent to ${email}`);
  console.log(`Reset link would contain token: ${resetToken}`);
  
  // Return success for now
  return { success: true };
}