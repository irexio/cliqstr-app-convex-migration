/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🔐 Disable lint blocking in production builds
  },
  images: {
    domains: ['utfs.io', 'uploadthing.com'], // ✅ Allow both production + temp UploadThing URLs
  },
  // Fix for dynamic server usage errors
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'cliqstr.app', '*.cliqstr.app', 'vercel.app', '*.vercel.app'],
    }
  },
  // Configure routes that need to be dynamically rendered
  output: "standalone",
  // This tells Next.js these routes should always be dynamically rendered
  appDir: true,
  // Explicitly set dynamic routes to prevent static rendering errors
  dynamicRoutes: [
    '/api/**',
    '/auth/**',
    '/account/**',
    '/profile/**',
    '/cliqs/**',
    '/choose-plan',
    '/verify-card',
    '/parent/**'
  ]
}

module.exports = nextConfig
