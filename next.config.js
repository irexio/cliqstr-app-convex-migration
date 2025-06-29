/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🔐 Disable lint blocking in production builds
  },
  images: {
    domains: ['utfs.io', 'uploadthing.com'], // ✅ Allow both production + temp UploadThing URLs
  },
}

module.exports = nextConfig
