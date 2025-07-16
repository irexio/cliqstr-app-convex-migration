// Global dynamic configuration for all routes
// This ensures all routes are rendered dynamically on the server
// and prevents "Dynamic server usage" errors in Vercel

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
