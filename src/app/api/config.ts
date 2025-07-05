// Prevent Next.js from trying to statically optimize API routes
// This solves the "Dynamic server usage" errors in Vercel deployment
export const dynamic = 'force-dynamic';
