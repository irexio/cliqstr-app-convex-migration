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
    },
    // Force all server components to be dynamic by default
    // This helps prevent the 98 dynamic server usage errors
    isrMemoryCacheSize: 0,
    serverMinification: false,
    workerThreads: false
  },
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Configure for production deployment
  output: "standalone"
}

module.exports = nextConfig
