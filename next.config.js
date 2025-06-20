/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🔐 Disable lint blocking in production builds
  },
  // You can add custom config here later if needed
};

module.exports = nextConfig;
