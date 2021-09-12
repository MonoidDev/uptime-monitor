import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { RequestObjectHandler } from '../utils/types';
import { Auth, AuthInfo } from './auth';

export type Context = {
  authInfo?: AuthInfo;
  prisma: PrismaClient;
  isLoggedIn: boolean;
};

const auth = new Auth();

export const createContext: RequestObjectHandler<Context> = async ({ req }) => {
  let authInfo: AuthInfo | undefined;
  const token = req.cookies?.uptimeMonitorToken;

  if (token) {
    try {
      authInfo = await auth.verify(token);
    } catch (e) {
      // TODO: use systematic logger
      console.warn('Authentication failed', e);
    }
  }

  return {
    authInfo,
    prisma,
    get isLoggedIn() {
      return Boolean(authInfo);
    },
  };
};
