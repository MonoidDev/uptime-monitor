import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { RequestObjectHandler } from '../utils/types';

export type Context = {
  // accessToken: string;
  prisma: PrismaClient;
};

export const createContext: RequestObjectHandler<Context> = async ({ req, res }) => {
  return {
    // accessToken,
    prisma,
  };
};
