import { ServerResponse } from 'http';

import { PrismaClient } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { EventService } from '../services/EventService';
import { TraceService } from '../services/TraceService';
import { UserService } from '../services/UserService';
import { WebsiteService } from '../services/WebsiteService';
import type { NextIncomingMessage, RequestObjectHandler } from '../utils/types';
import { Auth, AuthInfo } from './auth';

export type Context = {
  authInfo?: AuthInfo;
  prisma: PrismaClient;
  isLoggedIn: boolean;
  eventService: EventService;
  userService: UserService;
  eventService: EventService;
  websiteService: WebsiteService;
  traceService: TraceService;
  req: NextIncomingMessage;
  res: ServerResponse;
};

const auth = new Auth();

export const createContext: RequestObjectHandler<Context> = async ({ req, res }) => {
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
    eventService: new EventService(getContext),
    userService: new UserService(getContext),
    websiteService: new WebsiteService(getContext),
    traceService: new TraceService(getContext),
    eventService: new EventService(getContext),
    req,
    res,
  };

  function getContext() {
    return ctx;
  }

  return ctx;
};
