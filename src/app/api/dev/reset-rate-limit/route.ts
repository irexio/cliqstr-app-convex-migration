/**
 * Development-only API route to reset rate limits
 * Only available in non-production environments
 */

import { NextResponse, NextRequest } from 'next/server';
import { resetRateLimit, getRateLimitStatus, getClientIP } from '@/lib/auth/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Only allow in development or when TESTING_MODE is enabled
  if (process.env.NODE_ENV === 'production' && process.env.TESTING_MODE !== 'true') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { ip } = body;
    
    // Use provided IP or detect from request
    const targetIP = ip || getClientIP(req);
    
    // Reset the rate limit
    const success = resetRateLimit(targetIP);
    
    // Get current status
    const status = getRateLimitStatus(targetIP);
    
    return NextResponse.json({
      success,
      ip: targetIP,
      status: status ? {
        count: status.count,
        resetTime: new Date(status.resetTime).toISOString(),
        allowed: status.allowed
      } : 'No rate limit entry found'
    });
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return NextResponse.json({ error: 'Failed to reset rate limit' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Only allow in development or when TESTING_MODE is enabled
  if (process.env.NODE_ENV === 'production' && process.env.TESTING_MODE !== 'true') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get('ip') || getClientIP(req);
    
    const status = getRateLimitStatus(ip);
    
    return NextResponse.json({
      ip,
      status: status ? {
        count: status.count,
        resetTime: new Date(status.resetTime).toISOString(),
        allowed: status.allowed
      } : 'No rate limit entry found'
    });
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return NextResponse.json({ error: 'Failed to get rate limit status' }, { status: 500 });
  }
}
