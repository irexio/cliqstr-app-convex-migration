/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don’t block builds on lint in CI/prod
    ignoreDuringBuilds: true,
  },

  images: {
    // Allow UploadThing domains
    domains: ['utfs.io', 'uploadthing.com'],
  },

  experimental: {
    // Force webpack dev (avoid Turbopack hangs on Windows)
    turbo: { enabled: false },

    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'cliqstr.app',
        '*.cliqstr.app',
        'vercel.app',
        '*.vercel.app',
      ],
    },

    serverMinification: false,
    workerThreads: false,
  },

  reactStrictMode: true,
  swcMinify: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

// ✅ Use standalone only on Vercel. Locally, Next will serve static assets itself.
if (process.env.VERCEL === '1') {
  nextConfig.output = 'standalone';
}

module.exports = nextConfig;
