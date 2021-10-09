import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare const global: typeof globalThis & { prisma?: PrismaClient };

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: [
      {
        level: 'query',
        emit: 'event',
      },
    ],
  });

  if (process.env.LOG_SQL) {
    prisma.$on('query', console.info);
  }
  return prisma;
};

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;
