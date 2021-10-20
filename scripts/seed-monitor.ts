import dayjs from 'dayjs';

import { Context } from '../src/graphql/context';
import { prisma } from '../src/lib/prisma';
import { EventService } from '../src/services/EventService';
import { TraceService } from '../src/services/TraceService';
import { UserService } from '../src/services/UserService';
import { WebsiteService } from '../src/services/WebsiteService';

if (process.env.NODE_ENV !== 'development') {
  throw new Error('seed.ts is only for development!');
}

(async () => {
  await prisma.$queryRaw(`
    TRUNCATE TABLE "User" CASCADE;
  `);

  for (const seq of ['Event_id_seq', 'Trace_id_seq', 'User_id_seq', 'Website_id_seq']) {
    await prisma.$queryRaw(`
      ALTER SEQUENCE "${seq}" RESTART;
    `);
  }

  function getContext() {
    return ctx;
  }

  const ctx: Context = {
    prisma,
    isLoggedIn: false,
    eventService: new EventService(getContext),
    userService: new UserService(getContext),
    websiteService: new WebsiteService(getContext),
    traceService: new TraceService(getContext),
    req: {} as any,
    res: {} as any,
  };

  const user = await ctx.userService.createUser({
    email: 'django@gmail.com',
    inputPassword: '123123123',
  });

  await prisma.website.create({
    data: {
      userId: user.id,
      name: 'baidu',
      url: 'https://www.baidu.com',
      pingInterval: 5,
      enabled: true,
      emails: ['wangchenyu2017@gmail.com'],
      createdAt: dayjs().toISOString(),
    },
  });

  await prisma.website.create({
    data: {
      userId: user.id,
      name: 'nodns',
      url: 'https://thisdnsdoesnotexists',
      pingInterval: 5,
      enabled: true,
      emails: ['wangchenyu2017@gmail.com'],
      createdAt: dayjs().toISOString(),
    },
  });

  await prisma.$disconnect();
})();
