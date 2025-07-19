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
