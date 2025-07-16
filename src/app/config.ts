// Global configuration for Next.js App Router
// This ensures all routes are rendered dynamically on the server
// and prevents "Dynamic server usage" errors in Vercel

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// This file is imported by the Next.js App Router
// and applies these settings to all routes
