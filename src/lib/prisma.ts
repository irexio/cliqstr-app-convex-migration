import { PrismaClient } from '@prisma/client';

// For better handling of Neon database connections in serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection pooling options optimized for Neon
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pooling for better performance with Neon
    // @ts-ignore - PrismaClient constructor options
    __internal: {
      engine: {
        // Recommended for Neon
        connectionLimit: 5,
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Prevent hot-reloading issues during development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
