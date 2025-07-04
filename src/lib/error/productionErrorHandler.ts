/**
 * Production error handler to prevent code exposure
 * This module intercepts errors and provides sanitized messages in production
 */

export function sanitizeErrorForClient(error: unknown): { message: string } {
  // Always return a sanitized error object in production
  if (process.env.NODE_ENV === 'production') {
    // Log the full error server-side only
    console.error('Error details (server-only):', error);
    
    return { 
      message: 'An unexpected error occurred. Our team has been notified.'
    };
  }
  
  // In development, preserve error details for debugging
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { 
    message: String(error) 
  };
}
