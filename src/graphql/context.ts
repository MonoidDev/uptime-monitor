import { PrismaClient } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { TraceSerice } from '../services/TraceService';
import { UserService } from '../services/UserService';
import { WebsiteSerice } from '../services/WebsiteService';
import type { RequestObjectHandler } from '../utils/types';
import { Auth, AuthInfo } from './auth';

export type Context = {
  authInfo?: AuthInfo;
  prisma: PrismaClient;
  isLoggedIn: boolean;
  userService: UserService;
  websiteSerice: WebsiteSerice;
  traceSerice: TraceSerice;
};

const auth = new Auth();

export const createContext: RequestObjectHandler<Context> = async ({ req }) => {
  let authInfo: AuthInfo | undefined;
  const token = req.cookies?.uptimeMonitorToken
    ?? req.headers.authorization?.replace(/^Bearer /, '');

  if (token) {
    try {
      authInfo = await auth.verify(token);
    } catch (e) {
      // TODO: use systematic logger
      console.warn('Authentication failed', e);
    }
  }

  const ctx: Context = {
    authInfo,
    prisma,
    get isLoggedIn() {
      return Boolean(authInfo);
    },
    userService: new UserService(getContext),
    websiteSerice: new WebsiteSerice(getContext),
    traceSerice: new TraceSerice(getContext),
  };

  function getContext() {
    return ctx;
  }

  return ctx;
};
