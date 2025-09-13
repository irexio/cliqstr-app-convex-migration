/**
 * IP Rate Limiting for Auth Routes
 * Protects signup/signin routes from brute force attacks
 * 10 attempts per minute per IP address
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
// More permissive limits for testing - increase significantly for development
const MAX_ATTEMPTS = process.env.NODE_ENV === 'production' ? 10 : 100; // 100 attempts per minute in dev, 10 in prod

export function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const key = `auth:${ip}`;
  
  // Get the entry first so it's available throughout the function
  const entry = rateLimitStore.get(key);
  
  // Bypass rate limiting for development and testing environments
  if (process.env.NODE_ENV !== 'production') {
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === 'unknown';
    const isPrivateIP = ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
    
    if (isLocalhost || isPrivateIP) {
      console.log(`🔓 [RATE-LIMIT] Bypassing rate limit for development IP: ${ip}`);
      return { allowed: true };
    }
  }
  
  // For Vercel testing - be more permissive if we detect testing environment
  // Check for testing indicators in environment or URL
  const isTestingEnvironment = process.env.VERCEL_ENV === 'preview' || 
                              process.env.NODE_ENV === 'development' ||
                              process.env.TESTING_MODE === 'true';
  
  if (isTestingEnvironment) {
    console.log(`🔓 [RATE-LIMIT] Testing environment detected - using permissive limits for IP: ${ip}`);
    // Still apply some limits but much higher (500 attempts per minute for testing)
    const TESTING_MAX_ATTEMPTS = 500;
    
    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      });
      return { allowed: true };
    }
    
    if (entry.count >= TESTING_MAX_ATTEMPTS) {
      return { 
        allowed: false, 
        resetTime: entry.resetTime 
      };
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    return { allowed: true };
  }
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [k, cleanupEntry] of rateLimitStore.entries()) {
      if (now > cleanupEntry.resetTime) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  if (!entry || now > entry.resetTime) {
    // First attempt or window expired - reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }
  
  if (entry.count >= MAX_ATTEMPTS) {
    // Rate limit exceeded
    return { 
      allowed: false, 
      resetTime: entry.resetTime 
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return { allowed: true };
}

export function getClientIP(request: Request): string {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback - this won't work in production behind a proxy
  return 'unknown';
}

/**
 * Reset rate limit for a specific IP (useful for testing)
 * Only works in non-production environments
 */
export function resetRateLimit(ip: string): boolean {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Rate limit reset is disabled in production');
    return false;
  }
  
  const key = `auth:${ip}`;
  const deleted = rateLimitStore.delete(key);
  console.log(`🔄 [RATE-LIMIT] Reset rate limit for IP: ${ip} (${deleted ? 'success' : 'not found'})`);
  return deleted;
}

/**
 * Get current rate limit status for an IP (useful for debugging)
 */
export function getRateLimitStatus(ip: string): { count: number; resetTime: number; allowed: boolean } | null {
  const key = `auth:${ip}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  const allowed = now > entry.resetTime || entry.count < MAX_ATTEMPTS;
  
  return {
    count: entry.count,
    resetTime: entry.resetTime,
    allowed
  };
}
